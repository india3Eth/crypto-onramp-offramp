import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateSignature } from '@/utils/signature';
import type { Quote, ExchangeFormData } from '@/types/exchange';

interface BaseQuoteRequest {
  fromAmount: string;
  fromCurrency: string;
  toCurrency: string;
  chain?: string;
}

interface OnrampQuoteRequest extends BaseQuoteRequest {
  paymentMethodType: string;
}

interface OfframpQuoteRequest extends BaseQuoteRequest {
  paymentMethodType: string;
}

export class QuoteService {
  private apiKey: string;
  private apiBaseUrl: string;
  
  constructor() {
    this.apiKey = process.env.UNLIMIT_API_KEY || '';
    this.apiBaseUrl = process.env.UNLIMIT_API_BASE_URL || 'https://api-sandbox.gatefi.com';
    
    if (!this.apiKey) {
      console.warn('Warning: UNLIMIT_API_KEY not set. Quote service will not work properly.');
    }
  }
  
  /**
   * Create a quote for buying cryptocurrency (onramp)
   */
  async createOnrampQuote(data: OnrampQuoteRequest): Promise<Quote> {
    // Validate input
    if (!data.fromAmount || parseFloat(data.fromAmount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    return this.createQuote(data);
  }
  
  /**
   * Create a quote for selling cryptocurrency (offramp)
   */
  async createOfframpQuote(data: OfframpQuoteRequest): Promise<Quote> {
    // Validate input
    if (!data.fromAmount || parseFloat(data.fromAmount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    return this.createQuote(data);
  }
  
  /**
   * Generic method to create a quote
   */
  private async createQuote(data: ExchangeFormData): Promise<Quote> {
    // Prepare payload
    const payload = {
      fromAmount: data.fromAmount,
      fromCurrency: data.fromCurrency,
      toCurrency: data.toCurrency,
      paymentMethodType: data.paymentMethodType,
      ...(data.chain && { chain: data.chain }),
    };
    
    // API path for signature
    const path = '/v1/external/quotes';
    
    try {
      // Generate signature
      const signature = generateSignature('POST', path, payload);
      
      // Make API request
      const response = await fetch(`${this.apiBaseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          'signature': signature,
        },
        body: JSON.stringify(payload),
      });
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Quote API error:', errorData);
        throw new Error(`Failed to create quote: ${response.statusText}`);
      }
      
      // Parse quote data
      const quoteData: Quote = await response.json();
      
      // Store quote in database
      await this.saveQuoteToDb(quoteData);
      
      return quoteData;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }
  
  /**
   * Get a quote by ID
   */
  async getQuoteById(quoteId: string): Promise<Quote | null> {
    const db = await getDb();
    return db.collection<Quote>(COLLECTIONS.QUOTES).findOne({ quoteId });
  }
  
  /**
   * Save quote to database
   */
  private async saveQuoteToDb(quote: Quote): Promise<void> {
    const db = await getDb();
    
    // Add timestamps
    const quoteWithTimestamps = {
      ...quote,
      createdAt: new Date(),
      expiresAt: new Date(quote.expiration),
    };
    
    await db.collection(COLLECTIONS.QUOTES).updateOne(
      { quoteId: quote.quoteId },
      { $set: quoteWithTimestamps },
      { upsert: true }
    );
  }
}

// Export singleton instance
export const quoteService = new QuoteService();

// Export for testing or custom instances
export default QuoteService;