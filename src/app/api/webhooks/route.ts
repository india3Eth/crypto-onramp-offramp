import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/utils/crypto/signature';
import { UserModel } from '@/models/user';
import { logger } from '@/services/logger-service';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { TransactionService } from '@/services/transaction-service';
import { OnrampWebhookPayload, TransactionSSEEvent } from '@/types/exchange/webhook';

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

// Store for SSE connections (reserved for future use)
// const sseConnections = new Map<string, Response>();

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
        await handleOnrampWebhook(body as OnrampWebhookPayload);
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
 * Handle ONRAMP webhook events
 */
async function handleOnrampWebhook(payload: OnrampWebhookPayload) {
  try {
    logger.info('Processing ONRAMP webhook', {
      referenceId: payload.referenceId,
      status: payload.status,
      cryptoAmount: payload.metadata.cryptoAmount,
      cryptoCurrency: payload.metadata.cryptoCurrency,
      txHash: payload.metadata.txHash
    });
    
    // Try to find the user associated with this transaction
    // First, try to find by the destination wallet address
    let userId: string | undefined;
    let customerId: string | undefined;
    
    // TODO: Implement user lookup by wallet address or other means
    // For now, we'll update the transaction without user linking
    
    // Update transaction status in database
    const transaction = await TransactionService.updateTransactionFromOnrampWebhook(
      payload,
      userId,
      customerId
    );
    
    // Emit SSE event for real-time updates
    if (customerId) {
      await emitTransactionSSEEvent(customerId, {
        type: 'TRANSACTION_UPDATE',
        action: 'status_change',
        referenceId: payload.referenceId,
        status: transaction.status,
        txHash: payload.metadata.txHash,
        failReason: payload.metadata.failReason,
        metadata: {
          cryptoAmount: payload.metadata.cryptoAmount,
          fiatAmount: payload.metadata.fiatAmountSent,
          step: getOnrampStep(payload.status),
          totalSteps: 4
        }
      });
    }
    
    logger.info('ONRAMP webhook processed successfully', {
      referenceId: payload.referenceId,
      status: payload.status,
      transactionStatus: transaction.status
    });
    
  } catch (error) {
    logger.error('Error handling ONRAMP webhook', {
      referenceId: payload.referenceId,
      status: payload.status,
      error
    });
    throw error;
  }
}

/**
 * Get step number for ONRAMP progress (1-4)
 */
function getOnrampStep(status: OnrampWebhookPayload['status']): number {
  switch (status) {
    case 'FIAT_DEPOSIT_RECEIVED': return 1;
    case 'TRADE_COMPLETED': return 2;
    case 'ON_CHAIN_INITIATED': return 3;
    case 'ON_CHAIN_COMPLETED': return 4;
    case 'FAILED': return 0;
    default: return 0;
  }
}

/**
 * Emit transaction-specific SSE event
 */
async function emitTransactionSSEEvent(customerId: string, eventData: TransactionSSEEvent) {
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
            eventId: `sse_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
          }
        }
      } as any // MongoDB typing issue with dynamic push operations
    );
    
    logger.info('Transaction SSE event stored', { 
      customerId, 
      eventType: eventData.type,
      referenceId: eventData.referenceId,
      status: eventData.status
    });
    
  } catch (error) {
    logger.error('Error storing transaction SSE event', error);
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
            eventId: `sse_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
          }
        }
      } as any // MongoDB typing issue with dynamic push operations
    );
    
    logger.info('SSE event stored in database', { customerId, eventType: eventData.type });
    
  } catch (error) {
    logger.error('Error storing SSE event in database', error);
  }
}