// Base quote request interface
export interface QuoteRequest {
  fromAmount: string;
  toAmount: string;
  fromCurrency: string;
  toCurrency: string;
  paymentMethodType: string;
  chain?: string;
}

// Response from API
export interface Quote {
  quoteId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  paymentMethodType: string;
  rate: string;
  fees: Fee[];
  chain?: string;
  expiration: string;
  metadata: Record<string, any>;
}

export interface Fee {
  type: string;
  amount: string;
  currency: string;
}


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
  chain?: string; // Make chain optional
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
  chain?: string; // Make chain optional
  quote: Quote;
  fiatAccountId: string;
}

// Shared transaction status enum
export type TransactionStatus = 
  | "CREATED"
  | "FIAT_DEPOSIT_RECEIVED"
  | "TRADE_COMPLETED"
  | "ON_CHAIN_INITIATED"
  | "ON_CHAIN_COMPLETED"
  | "FAILED";

// KYC types
export interface KYCSubmission {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
}

export type KYCStatus = 
  | "IN_REVIEW"
  | "COMPLETED"
  | "UPDATE_REQUIRED"
  | "FAILED";

// KYC Level Limit types
export interface KycLevelLimit {
  reserveTransactions: number;
  reserveAmount: number;
  maxTransactions: number;
  maxAmount: number;
  period: string;
}

export interface KycLimits {
  current: {
    levelName: string;
    levelLimits: KycLevelLimit[];
  };
  next: {
    levelNames: string[] | null;
    levelLimits: Record<string, any> | null;
  };
}

// KYC Limit Check Result
export interface KycLimitCheckResult {
  success: boolean;
  limitExceeded: boolean;
  message: string;
  currentAmount?: number;
  maxAllowedAmount?: number;
  currency?: string;
  baseCurrency?: string;
  exchangeRate?: number;
  currentLevel?: string;
  nextLevel?: string;
  period?: string;
  remainingTransactions?: number;
}