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