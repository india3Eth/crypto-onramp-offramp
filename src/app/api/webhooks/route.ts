import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/utils/signature';
import { UserModel } from '@/models/user';
import { logger } from '@/services/logger-service';
import { getDb, COLLECTIONS } from '@/lib/mongodb';

// Generic webhook payload interface
interface WebhookPayload {
  eventType: string;
  status: string;
  referenceId: string;
  metadata: {
    customerId?: string;
    customerEmail?: string;
    kycLevel?: string[];
    [key: string]: any;
  };
}

// Store for SSE connections
const sseConnections = new Map<string, Response>();

export async function POST(request: NextRequest) {
  try {
    // Get the request body as text for signature verification
    const bodyText = await request.text();
    let body: WebhookPayload;
    
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    // Get the signature from the header
    const signature = request.headers.get('signature');
    
    // Verify signature if provided
    if (signature) {
      const isValid = verifySignature(signature, bodyText);
      
      if (!isValid) {
        logger.warn('Invalid webhook signature', { eventType: body.eventType });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      // Log warning but continue processing in case signature is optional
      logger.warn('Missing webhook signature', { eventType: body.eventType });
    }
    
    // Log the webhook event
    logger.info('Webhook received', { 
      eventType: body.eventType,
      status: body.status,
      customerId: body.metadata.customerId,
      referenceId: body.referenceId
    });
    
    // Handle different webhook types
    switch (body.eventType) {
      case 'KYC_REDIRECT':
        await handleKycRedirect(body);
        break;
      
      case 'KYC':
        await handleKycWebhook(body);
        break;
        
      case 'ONRAMP':
        // TODO: Implement onramp webhook handling
        logger.info('Onramp webhook received', { 
          status: body.status,
          referenceId: body.referenceId 
        });
        break;
        
      case 'OFFRAMP':
        // TODO: Implement offramp webhook handling
        logger.info('Offramp webhook received', { 
          status: body.status,
          referenceId: body.referenceId 
        });
        break;
        
      default:
        logger.warn('Unhandled webhook event type', { eventType: body.eventType });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('Error processing webhook', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle KYC_REDIRECT webhook
 * This is triggered when user completes KYC Level 2 or 3 and gets redirected
 */
async function handleKycRedirect(payload: WebhookPayload) {
  try {
    const { customerId, customerEmail, kycLevel } = payload.metadata;
    
    if (!customerId || !customerEmail) {
      logger.error('Missing required fields in KYC_REDIRECT webhook', payload.metadata);
      return;
    }
    
    logger.info('Processing KYC_REDIRECT webhook', {
      customerId,
      customerEmail,
      kycLevel,
      status: payload.status
    });
    
    // Emit SSE event to close iframe and redirect
    await emitSSEEvent(customerId, {
      type: 'KYC_REDIRECT',
      action: 'close_iframe_and_redirect',
      redirectUrl: '/profile',
      status: payload.status,
      kycLevel: kycLevel || []
    });
    
    logger.info('KYC_REDIRECT SSE event emitted successfully', { customerId });
    
  } catch (error) {
    logger.error('Error handling KYC_REDIRECT webhook', error);
  }
}

/**
 * Handle existing KYC webhook (status updates)
 */
async function handleKycWebhook(payload: WebhookPayload) {
  try {
    const { customerId, customerEmail } = payload.metadata;
    
    if (!customerId || !customerEmail) {
      logger.error('Missing required fields in KYC webhook', payload.metadata);
      return;
    }
    
    // Find user by customerId
    const user = await UserModel.findByCustomerId(customerId);
    
    if (!user) {
      logger.error('User not found for customerId', { customerId });
      return;
    }
    
    // Map external KYC status to our internal status
    let kycStatus;
    switch (payload.status) {
      case 'COMPLETED':
        kycStatus = 'COMPLETED';
        break;
      case 'FAILED':
        kycStatus = 'FAILED';
        break;
      case 'IN_REVIEW':
        kycStatus = 'PENDING';
        break;
      case 'UPDATE_REQUIRED':
        kycStatus = 'UPDATE_REQUIRED';
        break;
      default:
        kycStatus = 'PENDING';
    }
    
    // Update user's KYC status
    await UserModel.updateKYCStatus(
      user.email, 
      kycStatus as any, 
      null, // No status reason in this webhook
      payload.metadata.kycLevel?.[0] // Get first level from array
    );
    
    logger.info('KYC status updated successfully', {
      customerId,
      status: kycStatus,
      kycLevel: payload.metadata.kycLevel
    });
    
  } catch (error) {
    logger.error('Error handling KYC webhook', error);
  }
}

/**
 * Emit Server-Sent Event to connected clients
 */
async function emitSSEEvent(customerId: string, eventData: any) {
  try {
    // Store the event in MongoDB for the user session
    const db = await getDb();
    const usersCollection = db.collection(COLLECTIONS.USERS);
    
    // Update the user document with the SSE event
    await usersCollection.updateOne(
      { customerId },
      { 
        $push: { 
          sseEvents: {
            ...eventData,
            timestamp: new Date(),
            eventId: `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        }
      }
    );
    
    logger.info('SSE event stored in database', { customerId, eventType: eventData.type });
    
  } catch (error) {
    logger.error('Error storing SSE event in database', error);
  }
}