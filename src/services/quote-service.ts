import { apiClient, ApiError } from '@/lib/api-client';
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
      const quote = await apiClient.request<Quote>('POST', API_PATHS.QUOTE, data);
      
      // Ensure fees field is always an array
      if (!quote.fees) {
        quote.fees = [];
      }
      
      return quote;
    } catch (error) {
      // Log the detailed error for debugging
      console.error('Error creating quote:', error);
      
      // If it's an ApiError, preserve the structure and error message from the API
      if (error instanceof ApiError && error.errorMessage) {
        // Create a new error that preserves the API error message but with a more informative context
        const enhancedError = new Error(`Quote creation failed: ${error.errorMessage}`);
        // Copy all properties from the original error to preserve the full error structure
        Object.assign(enhancedError, error);
        throw enhancedError;
      }
      
      // Rethrow the original error if it's not a recognized API error
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