import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/utils/signature';
import { UserModel } from '@/models/user';
import { logger } from '@/services/logger-service';
import { emailService } from '@/services/email-service';

// KYC webhook payload interface
interface KYCWebhookPayload {
  event: string;
  data: {
    customerId: string;
    submissionId: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'UPDATE_REQUIRED';
    reason?: string;
    timestamp: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body as text for signature verification
    const bodyText = await request.text();
    let body: KYCWebhookPayload;
    
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
        logger.warn('Invalid webhook signature', { event: body.event });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      // Log warning but continue processing in case signature is optional
      logger.warn('Missing webhook signature', { event: body.event });
    }
    
    // Log the webhook event
    logger.info('KYC webhook received', { 
      event: body.event,
      customerId: body.data.customerId,
      submissionId: body.data.submissionId,
      status: body.data.status
    });
    
    // Handle KYC verification status update
    if (body.event === 'kyc.status.updated') {
      // Find user by customerId
      const user = await UserModel.findByCustomerId(body.data.customerId);
      
      if (!user) {
        logger.error('User not found for customerId', { 
          customerId: body.data.customerId 
        });
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Map external KYC status to our internal status
      let kycStatus;
      switch (body.data.status) {
        case 'APPROVED':
          kycStatus = 'COMPLETED';
          break;
        case 'REJECTED':
          kycStatus = 'FAILED';
          break;
        case 'PENDING':
          kycStatus = 'PENDING';
          break;
        case 'UPDATE_REQUIRED':
          kycStatus = 'UPDATE_REQUIRED';
          break;
        default:
          kycStatus = 'PENDING';
      }
      
      // Update user's KYC status
      await UserModel.updateKYCStatus(user.email, kycStatus as 'COMPLETED' | 'PENDING' | 'UPDATE_REQUIRED' | 'FAILED' | 'NONE', body.data.reason);
      
      // Send email notification to user based on status
      if (kycStatus === 'COMPLETED') {
        await emailService.sendKycApprovedEmail(user.email, user.firstName);
      } else if (kycStatus === 'FAILED' || kycStatus === 'UPDATE_REQUIRED') {
        await emailService.sendKycRejectedEmail(user.email, user.firstName, body.data.reason);
      }
      
      logger.info('KYC status updated successfully', {
        customerId: body.data.customerId,
        status: kycStatus
      });
      
      return NextResponse.json({ success: true });
    }
    
    // Unhandled event type
    logger.warn('Unhandled webhook event type', { event: body.event });
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('Error processing KYC webhook', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}