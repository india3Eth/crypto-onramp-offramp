import { NextResponse } from "next/server"
import { generateSignature } from "@/utils/signature"

export async function POST(req: Request) {
  const body = await req.json()
  const { fromAmount, fromCurrency, toCurrency, paymentMethodType, chain } = body

  const apiKey = process.env.UNLIMIT_API_KEY
  const apiUrl = process.env.UNLIMIT_API_URL || "https://api-sandbox.gatefi.com/v1/external"

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(`${apiUrl}/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        signature: generateSignature("POST","/v1/external/quotes"),
      },
      body: JSON.stringify({
        fromAmount,
        fromCurrency,
        toCurrency,
        paymentMethodType,
        chain,
      }),
    })

    console.log(response)

    if (!response.ok) {
      throw new Error("Failed to create quote")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating quote:", error)
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 })
  }
}

