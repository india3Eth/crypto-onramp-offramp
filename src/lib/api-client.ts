import { generateSignature } from '@/utils/crypto/signature';

interface ApiClientOptions {
  baseUrl?: string;
  maxRetries?: number;
  retryDelay?: number;
}

// Enhanced API Error class that preserves the original API error structure
export class ApiError extends Error {
  public status: number;
  public errorCode?: number;
  public errorMessage?: string;
  public errorMetadata?: any;
  public originalResponse?: Response;

  constructor(message: string, status: number, apiResponse?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    
    // Capture specific API error details when available
    if (apiResponse) {
      this.errorCode = apiResponse.errorCode;
      this.errorMessage = apiResponse.errorMessage;
      this.errorMetadata = apiResponse.errorMetadata;
    }
  }
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
   * Enhanced to properly capture and expose API error details
   */
  async request<T>(
    method: string,
    path: string,
    payload?: Record<string, any>,
    headers?: Record<string, string>,
    retryCount = 0
  ): Promise<T> {
    try {
      // Generate signature
      const signature = generateSignature(method, path);
      
      // Create request options
      const customHeaders = headers || {};
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          'signature': signature,
          ...customHeaders,
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
          // Parse the error response to get detailed error information
          errorData = await response.json();
          
          // Create a more informative error message including the API's errorMessage if available
          if (errorData.errorMessage) {
            errorMessage = `API request failed: ${errorData.errorMessage}`;
          }
          
          // Throw an enhanced error with all API error details
          const apiError = new ApiError(errorMessage, response.status, errorData);
          apiError.originalResponse = response;
          throw apiError;
        } catch (e) {
          // If error parsing failed or it's not a JSON response
          if (!(e instanceof ApiError)) {
            // Create a basic API error if we couldn't parse the response
            const basicApiError = new ApiError(errorMessage, response.status);
            basicApiError.originalResponse = response;
            throw basicApiError;
          }
          throw e;
        }
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
        return this.request<T>(method, path, payload, headers, retryCount + 1);
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
    
    // For ApiError instances, check the status code
    if (error instanceof ApiError) {
      // Retry on server errors (5xx)
      if (error.status >= 500 && error.status < 600) return true;
      // Retry on rate limiting (429)
      if (error.status === 429) return true;
      // Don't retry on other client errors (4xx)
      if (error.status >= 400 && error.status < 500) return false;
    }
    
    // Retry on network errors
    return true;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();