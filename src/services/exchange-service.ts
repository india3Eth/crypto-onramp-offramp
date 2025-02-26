import type { ExchangeFormData, Quote, OnrampTransaction, OfframpTransaction } from "@/types/exchange"
import { generateSignature } from "@/utils/signature"

/**
 * Exchange Service
 * 
 * Provides methods for interacting with the exchange API
 */
export class ExchangeService {
  private apiKey: string | null = null
  private apiBaseUrl: string = process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com"
  
  /**
   * Create a quote for buying or selling cryptocurrency
   */
  async createQuote(data: ExchangeFormData): Promise<Quote> {
    // Validate input
    if (!data.fromAmount || parseFloat(data.fromAmount) <= 0) {
      throw new Error("Invalid amount")
    }
    
    // Prepare payload
    const payload = {
      fromAmount: data.fromAmount,
      fromCurrency: data.fromCurrency,
      toCurrency: data.toCurrency,
      paymentMethodType: data.paymentMethodType,
      chain: data.chain,
    }
    
    // API path for signature
    const path = "/v1/external/quotes"
    
    try {
      // Make API request with proper headers and signature
      const response = await this.makeApiRequest(path, {
        method: "POST",
        body: JSON.stringify(payload),
      })
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("Quote API error:", errorData)
        throw new Error(`Failed to create quote: ${response.statusText}`)
      }
      
      // Return quote data
      return response.json()
    } catch (error) {
      console.error("Error creating quote:", error)
      throw error
    }
  }
  
  /**
   * Create a transaction for buying cryptocurrency (onramp)
   */
  async createOnrampTransaction(quoteId: string, customerId: string): Promise<OnrampTransaction> {
    // API path for signature
    const path = "/v1/external/onramp/transactions"
    
    // Prepare payload
    const payload = {
      quoteId,
      customerId,
    }
    
    try {
      // Make API request
      const response = await this.makeApiRequest(path, {
        method: "POST",
        body: JSON.stringify(payload),
      })
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("Transaction API error:", errorData)
        throw new Error(`Failed to create transaction: ${response.statusText}`)
      }
      
      // Return transaction data
      return response.json()
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
  }
  
  /**
   * Create a transaction for selling cryptocurrency (offramp)
   */
  async createOfframpTransaction(
    quoteId: string, 
    customerId: string,
    userWalletAddress: string,
    fiatAccountId: string
  ): Promise<OfframpTransaction> {
    // API path for signature
    const path = "/v1/external/offramp/transactions"
    
    // Prepare payload
    const payload = {
      quoteId,
      customerId,
      userWalletAddress,
      fiatAccountId
    }
    
    try {
      // Make API request
      const response = await this.makeApiRequest(path, {
        method: "POST",
        body: JSON.stringify(payload),
      })
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("Transaction API error:", errorData)
        throw new Error(`Failed to create transaction: ${response.statusText}`)
      }
      
      // Return transaction data
      return response.json()
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
  }
  
  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<any> {
    // API path for signature
    const path = `/v1/external/transactions/${transactionId}`
    
    try {
      // Make API request
      const response = await this.makeApiRequest(path, {
        method: "GET",
      })
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("Transaction status API error:", errorData)
        throw new Error(`Failed to get transaction status: ${response.statusText}`)
      }
      
      // Return transaction data
      return response.json()
    } catch (error) {
      console.error("Error getting transaction status:", error)
      throw error
    }
  }
  
  /**
   * Helper method to make API requests with proper authentication
   */
  private async makeApiRequest(
    path: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    // Get API key
    const apiKey = process.env.UNLIMIT_API_KEY || this.apiKey
    
    if (!apiKey) {
      throw new Error("API Key is missing")
    }
    
    // Generate signature
    const payload = options.body ? JSON.parse(options.body as string) : undefined
    const signature = generateSignature(options.method || "GET", path, payload)
    
    // Create headers
    const headers = {
      "Content-Type": "application/json",
      "api-key": apiKey,
      "signature": signature,
      ...(options.headers || {})
    }
    
    // Make request
    return fetch(`${this.apiBaseUrl}${path}`, {
      ...options,
      headers,
    })
  }
  
  /**
   * Set API key for client-side usage (use with caution)
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }
  
  /**
   * Set API base URL
   */
  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url
  }
}

// Export a singleton instance
export const exchangeService = new ExchangeService()

// Also export for testing or custom instances
export default ExchangeService