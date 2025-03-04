import { generateSignature } from '@/utils/signature';

export class ApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.UNLIMIT_API_KEY || '';
    this.baseUrl = process.env.UNLIMIT_API_BASE_URL || 'https://api-sandbox.gatefi.com';
    
    if (!this.apiKey) {
      console.warn('Warning: UNLIMIT_API_KEY not set. API client will not work properly.');
    }
  }
  
  /**
   * Make an authenticated API request
   */
  async request<T>(
    method: string,
    path: string,
    payload?: Record<string, any>
  ): Promise<T> {
    // Generate signature
    console.log('Generating signature for:', method, path);
    const signature = generateSignature(method, path);
    console.log('Generated signature:', signature);
    // Create request options
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        'signature': signature,
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
      const errorData = await response.json().catch(() => null);
      console.error(`API error: ${path}`, errorData);
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    // Parse and return JSON response
    return response.json();
  }
}


// Export singleton instance
export const apiClient = new ApiClient();