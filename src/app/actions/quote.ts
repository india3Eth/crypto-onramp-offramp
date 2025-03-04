"use server"

import { quoteService } from '@/services/quote-service';
import type { QuoteRequest, Quote } from '@/types/exchange';

/**
 * Server action to create a quote
 */
export async function createQuote(data: QuoteRequest): Promise<Quote> {
  try {
    return await quoteService.createQuote(data);
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