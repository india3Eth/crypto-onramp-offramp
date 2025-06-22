// Transaction fee interface
export interface TransactionFee {
  type: "processingFee" | "networkFee" | "markupFee";
  amount: string;
  currency: string;
}

// Enhanced quote interface for transactions
export interface TransactionQuote {
  quoteId: string;
  fromCurrency: string;
  toCurrency: string;
  toAmount: string;
  fromAmount: string;
  rate: string;
  fees: TransactionFee[];
  paymentMethodType: string;
  expiration: string;
  chain?: string;
  metadata: Record<string, any>;
}

// Shared transaction status enum
export type TransactionStatus = 
  | "CREATED"
  | "FIAT_DEPOSIT_RECEIVED"
  | "TRADE_COMPLETED"
  | "ON_CHAIN_INITIATED"
  | "ON_CHAIN_COMPLETED"
  | "FAILED";

// Onramp transaction interface (buy crypto)
export interface OnrampTransaction {
  transactionId: string;
  customerId: string;
  fiatAccountId?: string;
  createdAt: string;
  updatedAt: string;
  quoteId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  status: TransactionStatus;
  txHash?: string;
  depositAddress: string;
  paymentMethodType: string;
  quote: TransactionQuote;
}

// Offramp transaction interface (sell crypto)
export interface OfframpTransaction {
  transactionId: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  quoteId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  status: TransactionStatus;
  txHash?: string;
  userWalletAddress: string;
  paymentMethodType: string;
  chain: string;
  quote: TransactionQuote;
  fiatAccountId: string;
  depositAddress: string;
  expiration: string;
  memo?: string;
}

// API response interfaces
export interface OnrampTransactionsResponse {
  transactions: OnrampTransaction[];
}

export interface OfframpTransactionsResponse {
  transactions: OfframpTransaction[];
}

// Union type for any transaction
export type Transaction = OnrampTransaction | OfframpTransaction;

// Transaction type helper
export function isOnrampTransaction(transaction: Transaction): transaction is OnrampTransaction {
  return 'depositAddress' in transaction && !('userWalletAddress' in transaction);
}

export function isOfframpTransaction(transaction: Transaction): transaction is OfframpTransaction {
  return 'userWalletAddress' in transaction && 'chain' in transaction;
}