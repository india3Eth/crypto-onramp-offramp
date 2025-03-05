import { apiClient } from '@/lib/api-client';
import type { QuoteRequest, Quote } from '@/types/exchange';

// API paths
const API_PATHS = {
  QUOTE: '/v1/external/quotes',
};

export class QuoteService {
  /**
   * Create a new quote
   * Handles bidirectional quoting (fromAmount or toAmount can be provided)
   */
  async createQuote(data: QuoteRequest): Promise<Quote> {
    // Validate that we have at least one amount
    if (!data.fromAmount && !data.toAmount) {
      throw new Error('Either fromAmount or toAmount must be provided');
    }
    
    // Validate currencies
    if (!data.fromCurrency || !data.toCurrency) {
      throw new Error('Both fromCurrency and toCurrency are required');
    }
    
    // Validate payment method
    if (!data.paymentMethodType) {
      throw new Error('Payment method is required');
    }
    
    try {
      // Call API to get quote
      return await apiClient.request<Quote>('POST', API_PATHS.QUOTE, data);
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }
  
  /**
   * Create a quote for buying crypto (onramp)
   * This is a convenience method that ensures fromAmount is used (fiat)
   */
  async createOnrampQuote(data: Omit<QuoteRequest, 'toAmount'> & { fromAmount: string }): Promise<Quote> {
    const quoteRequest: QuoteRequest = {
      ...data,
      toAmount: ''  // Ensure toAmount is empty for onramp
    };
    
    return this.createQuote(quoteRequest);
  }
  
  /**
   * Create a quote for selling crypto (offramp)
   * This is a convenience method that ensures fromAmount is used (crypto)
   */
  async createOfframpQuote(data: Omit<QuoteRequest, 'toAmount'> & { fromAmount: string }): Promise<Quote> {
    const quoteRequest: QuoteRequest = {
      ...data,
      toAmount: ''  // Ensure toAmount is empty for offramp
    };
    
    return this.createQuote(quoteRequest);
  }
}

// Export singleton instance
export const quoteService = new QuoteService();