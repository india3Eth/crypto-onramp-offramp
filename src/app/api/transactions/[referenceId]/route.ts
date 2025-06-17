import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/services/transaction-service';
import { getCurrentUser } from '@/utils/auth/auth';
import { logger } from '@/services/logger-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { referenceId: string } }
) {
  try {
    const { referenceId } = params;
    
    if (!referenceId) {
      return NextResponse.json(
        { error: 'Reference ID is required' },
        { status: 400 }
      );
    }

    // Get current user (optional - could be public for some use cases)
    const currentUser = await getCurrentUser();
    
    // Fetch transaction
    const transaction = await TransactionService.getTransactionByReferenceId(referenceId);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Optional: Check if user has access to this transaction
    // For now, we'll allow anyone with the reference ID to view it
    // In production, you might want to add proper authorization
    
    logger.info('Transaction details retrieved', {
      referenceId,
      status: transaction.status,
      userId: currentUser?.email || 'anonymous'
    });

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    logger.error('Error fetching transaction details', {
      referenceId: params.referenceId,
      error
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}