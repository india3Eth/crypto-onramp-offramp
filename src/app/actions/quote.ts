"use server"

import type { ExchangeFormData, Quote } from "@/types/exchange"
import { generateSignature } from "@/utils/signature"


export async function createQuote(data: ExchangeFormData): Promise<Quote> {
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
  
  // API key is required
  const apiKey = process.env.UNLIMIT_API_KEY
  if (!apiKey) {
    throw new Error("API Key is missing")
  }
  
  // API path for signature
  const path = "/v1/external/quotes"
  const method = "POST"
  try {
    // Generate signature
    const signature = generateSignature(method,path)
    console.log("signature : ",signature)
    // Make API request
    const response = await fetch(`${process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com"}/v1/external/quotes`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "signature": signature,
      },
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

// For testing purposes - you can check if an API key is configured
export async function checkApiConfig() {
  return {
    hasApiKey: !!process.env.UNLIMIT_API_KEY,
    hasApiSecret: !!process.env.UNLIMIT_API_SECRET_KEY,
    baseUrl: process.env.UNLIMIT_API_BASE_URL || "https://api-sandbox.gatefi.com",
  }
}