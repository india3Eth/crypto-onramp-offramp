"use server"
import type { ExchangeFormData, Quote } from "@/types/exchange"
// import { generateSignature } from "@/utils/signature"

export async function createQuote(data: ExchangeFormData): Promise<Quote> {
  const response = await fetch("https://api-sandbox.gatefi.com/v1/external/quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.UNLIMIT_API_KEY!,
    //   signature: generateSignature("/v1/external/quotes"), // You'll need to implement this
    },
    body: JSON.stringify({
      fromAmount: data.fromAmount,
      fromCurrency: data.fromCurrency,
      toCurrency: data.toCurrency,
      paymentMethodType: data.paymentMethodType,
      chain: data.chain,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create quote")
  }

  return response.json()
}