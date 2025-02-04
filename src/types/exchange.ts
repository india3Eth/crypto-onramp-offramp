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
  
  