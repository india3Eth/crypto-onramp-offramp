// Exchange types based on Unlimit API documentation

export interface Quote {
  quoteId: string
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
  paymentMethodType: string
  rate: string
  fees: Fee[]
  chain: string
  expiration: string
  metadata: any
}

export interface Fee {
  type: string
  amount: string
  currency: string
}

export interface ExchangeFormData {
  fromAmount: string
  fromCurrency: string
  toCurrency: string
  paymentMethodType: string
  chain: string
}

// Onramp transaction types
export interface OnrampTransaction {
  transactionId: string
  customerId: string
  createdAt: string
  updatedAt: string
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
  status: TransactionStatus
  depositAddress: string
  paymentMethodType: string
  chain: string
  quote: Quote
  metadata: any
}

// Offramp transaction types
export interface OfframpTransaction {
  transactionId: string
  customerId: string
  createdAt: string
  updatedAt: string
  quoteId: string
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
  status: TransactionStatus
  userWalletAddress: string
  paymentMethodType: string
  chain: string
  quote: Quote
  fiatAccountId: string
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
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  countryOfResidence: string
}

export type KYCStatus = 
  | "IN_REVIEW"
  | "COMPLETED"
  | "UPDATE_REQUIRED"
  | "FAILED";