import { Quote } from './quote';

// Shared transaction status enum
export type TransactionStatus = 
  | "CREATED"
  | "FIAT_DEPOSIT_RECEIVED"
  | "TRADE_COMPLETED"
  | "ON_CHAIN_INITIATED"
  | "ON_CHAIN_COMPLETED"
  | "FAILED";

// Onramp transaction types
export interface OnrampTransaction {
  transactionId: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  status: TransactionStatus;
  depositAddress: string;
  paymentMethodType: string;
  chain?: string;
  quote: Quote;
  metadata: any;
}

// Offramp transaction types
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
  userWalletAddress: string;
  paymentMethodType: string;
  chain?: string;
  quote: Quote;
  fiatAccountId: string;
}