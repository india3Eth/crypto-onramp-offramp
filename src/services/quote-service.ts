import { apiClient } from '@/lib/api-client';
import type { QuoteRequest, Quote } from '@/types/exchange';

// API paths
const API_PATHS = {
  QUOTE: '/v1/external/quotes',
};

export class QuoteService {
  /**
   * Create a new quote
   */
  async createQuote(data: QuoteRequest): Promise<Quote> {
    // Validate input
    if (!data.fromAmount || parseFloat(data.fromAmount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    try {
      // Call API to get quote
      return await apiClient.request<Quote>('POST', API_PATHS.QUOTE, data);
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const quoteService = new QuoteService();
