/**
 * Webhook payload types for transaction events
 */

// Base webhook payload structure
export interface WebhookPayload {
  eventType: 'ONRAMP' | 'OFFRAMP' | 'KYC' | 'KYC_REDIRECT';
  status: string;
  referenceId: string;
  metadata: {
    [key: string]: any;
  };
}

// ONRAMP specific webhook metadata
export interface OnrampWebhookMetadata {
  api_version: string;
  created_at: number;
  cryptoAmount: string;
  cryptoCurrency: string;
  destinationWallet: string;
  fiatAccountId?: string;
  fiatAmountSent: string;
  fiatCurrency: string;
  id: string;
  networkId: string;
  paymentMethod: string;
  tapOnFeeAmount: string;
  tapOnFeeCurrency: string;
  txHash?: string; // Available for ON_CHAIN_INITIATED and ON_CHAIN_COMPLETED
  failReason?: string; // Available for FAILED status
}

// ONRAMP webhook payload
export interface OnrampWebhookPayload extends WebhookPayload {
  eventType: 'ONRAMP';
  status: 'FIAT_DEPOSIT_RECEIVED' | 'TRADE_COMPLETED' | 'ON_CHAIN_INITIATED' | 'ON_CHAIN_COMPLETED' | 'FAILED';
  metadata: OnrampWebhookMetadata;
}

// Transaction status tracking
export interface TransactionStatus {
  referenceId: string;
  userId?: string;
  customerId?: string;
  orderQuoteId?: string; // Link to original quote
  status: 'pending' | 'payment_received' | 'trade_completed' | 'withdrawal_initiated' | 'completed' | 'failed';
  transactionType: 'onramp' | 'offramp';
  
  // Transaction details
  cryptoAmount: string;
  cryptoCurrency: string;
  fiatAmount: string;
  fiatCurrency: string;
  destinationWallet: string;
  networkId: string;
  paymentMethod: string;
  
  // Fees
  tapOnFeeAmount: string;
  tapOnFeeCurrency: string;
  
  // Blockchain details (when available)
  txHash?: string;
  
  // Error details (if failed)
  failReason?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// SSE Event for real-time updates
export interface TransactionSSEEvent {
  type: 'TRANSACTION_UPDATE';
  action: 'status_change';
  referenceId: string;
  status: TransactionStatus['status'];
  txHash?: string;
  failReason?: string;
  metadata?: {
    cryptoAmount?: string;
    fiatAmount?: string;
    step?: number; // 1-4 for onramp progress
    totalSteps?: number;
  };
}