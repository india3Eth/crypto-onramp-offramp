// Updated version of the src/lib/api-client.ts file
// This adds support for custom headers in API requests

import { generateSignature } from '@/utils/signature';

interface ApiClientOptions {
  baseUrl?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export class ApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  
  constructor(options: ApiClientOptions = {}) {
    this.apiKey = process.env.UNLIMIT_API_KEY || '';
    this.baseUrl = options.baseUrl || process.env.UNLIMIT_API_BASE_URL || 'https://api-sandbox.gatefi.com';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    if (!this.apiKey) {
      console.warn('Warning: UNLIMIT_API_KEY not set. API client will not work properly.');
    }
  }
  
  /**
   * Sleep helper for retry logic
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Make an authenticated API request with automatic retries
   * Added support for custom headers
   */
  async request<T>(
    method: string,
    path: string,
    payload?: Record<string, any>,
    customHeaders?: Record<string, string>,
    retryCount = 0
  ): Promise<T> {
    try {
      // Generate signature
      const signature = generateSignature(method, path);
      
      // Create request options
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          'signature': signature,
          ...customHeaders, // Add custom headers
        },
      };
      
      // Add body for non-GET requests
      if (method !== 'GET' && payload) {
        options.body = JSON.stringify(payload);
      }
      
      // Make the request
      const response = await fetch(`${this.baseUrl}${path}`, options);
      
      // Handle error responses
      if (!response.ok) {
        let errorMessage = `API request failed: ${response.statusText}`;
        let errorData = null;
        
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Failed to parse error as JSON, use default message
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }
      
      // Parse and return JSON response
      return response.json();
    } catch (error) {
      // Check if we should retry
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, retryCount);
        console.warn(`API request failed, retrying in ${delay}ms (${retryCount + 1}/${this.maxRetries})`, { method, path, error });
        
        await this.sleep(delay);
        return this.request<T>(method, path, payload, customHeaders, retryCount + 1);
      }
      
      // Max retries exceeded or non-retryable error
      console.error(`API request failed after ${retryCount} retries:`, { method, path, error });
      throw error;
    }
  }
  
  /**
   * Determine if an error is retryable
   */
  private shouldRetry(error: any): boolean {
    // Network errors are retryable
    if (!(error instanceof Error)) return false;
    
    // Retry on network errors or 5xx server errors
    if (!(error as any).status) return true; // Network error
    if ((error as any).status >= 500 && (error as any).status < 600) return true; // Server error
    
    // Don't retry client errors (except 429 Too Many Requests)
    if ((error as any).status === 429) return true;
    if ((error as any).status >= 400 && (error as any).status < 500) return false;
    
    return true; // Retry by default
  }
}

// Export singleton instance
export const apiClient = new ApiClient();