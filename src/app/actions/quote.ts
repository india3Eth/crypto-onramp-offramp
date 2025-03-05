"use server"

import { quoteService } from '@/services/quote-service';
import type { QuoteRequest, Quote } from '@/types/exchange';

/**
 * Server action to create a quote
 * This accepts either fromAmount or toAmount (but not both)
 */
export async function createQuote(data: QuoteRequest): Promise<Quote> {
  try {
    // Ensure we only have one amount value set (fromAmount or toAmount)
    // If both are provided, prioritize the non-empty one
    const cleanedData = { ...data };
    
    if (cleanedData.fromAmount && cleanedData.toAmount) {
      // Both amounts are provided, keep the non-empty one
      // If both have values, prioritize fromAmount (can be adjusted based on requirements)
      if (cleanedData.fromAmount) {
        cleanedData.toAmount = "";
      } else {
        cleanedData.fromAmount = "";
      }
    }
    
    // Call the quote service
    return await quoteService.createQuote(cleanedData);
  } catch (error) {
    console.error('Server action error creating quote:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error creating quote');
  }
}

export async function checkApiConfig() {
  return {
    hasApiKey: !!process.env.UNLIMIT_API_KEY,
    hasApiSecret: !!process.env.UNLIMIT_API_SECRET_KEY,
    baseUrl: process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com",
  }
}