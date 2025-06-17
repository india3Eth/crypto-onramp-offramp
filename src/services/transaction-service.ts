import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { TransactionStatus, OnrampWebhookPayload } from '@/types/exchange/webhook';
import { logger } from '@/services/logger-service';

export class TransactionService {
  
  /**
   * Create or update a transaction from ONRAMP webhook
   */
  static async updateTransactionFromOnrampWebhook(
    payload: OnrampWebhookPayload, 
    userId?: string, 
    customerId?: string
  ): Promise<TransactionStatus> {
    const db = await getDb();
    const collection = db.collection<TransactionStatus>(COLLECTIONS.TRANSACTIONS || 'transactions');
    
    // Map webhook status to our internal status
    let status: TransactionStatus['status'];
    let step = 0;
    
    switch (payload.status) {
      case 'FIAT_DEPOSIT_RECEIVED':
        status = 'payment_received';
        step = 1;
        break;
      case 'TRADE_COMPLETED':
        status = 'trade_completed';
        step = 2;
        break;
      case 'ON_CHAIN_INITIATED':
        status = 'withdrawal_initiated';
        step = 3;
        break;
      case 'ON_CHAIN_COMPLETED':
        status = 'completed';
        step = 4;
        break;
      case 'FAILED':
        status = 'failed';
        break;
      default:
        status = 'pending';
    }
    
    const now = new Date();
    const transactionData: Partial<TransactionStatus> = {
      referenceId: payload.referenceId,
      userId,
      customerId,
      status,
      transactionType: 'onramp',
      
      // Transaction details from webhook
      cryptoAmount: payload.metadata.cryptoAmount,
      cryptoCurrency: payload.metadata.cryptoCurrency,
      fiatAmount: payload.metadata.fiatAmountSent,
      fiatCurrency: payload.metadata.fiatCurrency,
      destinationWallet: payload.metadata.destinationWallet,
      networkId: payload.metadata.networkId,
      paymentMethod: payload.metadata.paymentMethod,
      
      // Fees
      tapOnFeeAmount: payload.metadata.tapOnFeeAmount,
      tapOnFeeCurrency: payload.metadata.tapOnFeeCurrency,
      
      // Optional fields
      ...(payload.metadata.txHash && { txHash: payload.metadata.txHash }),
      ...(payload.metadata.failReason && { failReason: payload.metadata.failReason }),
      ...(status === 'completed' && { completedAt: now }),
      
      updatedAt: now
    };
    
    // Upsert transaction
    const result = await collection.findOneAndUpdate(
      { referenceId: payload.referenceId },
      { 
        $set: transactionData,
        $setOnInsert: { createdAt: now }
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );
    
    logger.info('Transaction updated from ONRAMP webhook', {
      referenceId: payload.referenceId,
      status: payload.status,
      internalStatus: status,
      step,
      txHash: payload.metadata.txHash
    });
    
    return result as TransactionStatus;
  }
  
  /**
   * Get transaction by reference ID
   */
  static async getTransactionByReferenceId(referenceId: string): Promise<TransactionStatus | null> {
    const db = await getDb();
    const collection = db.collection<TransactionStatus>(COLLECTIONS.TRANSACTIONS || 'transactions');
    
    return collection.findOne({ referenceId });
  }
  
  /**
   * Get transactions by user ID
   */
  static async getTransactionsByUserId(userId: string): Promise<TransactionStatus[]> {
    const db = await getDb();
    const collection = db.collection<TransactionStatus>(COLLECTIONS.TRANSACTIONS || 'transactions');
    
    return collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }
  
  /**
   * Get transactions by customer ID
   */
  static async getTransactionsByCustomerId(customerId: string): Promise<TransactionStatus[]> {
    const db = await getDb();
    const collection = db.collection<TransactionStatus>(COLLECTIONS.TRANSACTIONS || 'transactions');
    
    return collection
      .find({ customerId })
      .sort({ createdAt: -1 })
      .toArray();
  }
  
  /**
   * Link transaction to original quote/order
   */
  static async linkTransactionToQuote(referenceId: string, orderQuoteId: string): Promise<void> {
    const db = await getDb();
    const collection = db.collection<TransactionStatus>(COLLECTIONS.TRANSACTIONS || 'transactions');
    
    await collection.updateOne(
      { referenceId },
      { $set: { orderQuoteId, updatedAt: new Date() } }
    );
    
    logger.info('Transaction linked to quote', { referenceId, orderQuoteId });
  }
}

export default TransactionService;