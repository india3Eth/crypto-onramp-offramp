"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"
import { BuySellToggle } from "@/components/buy-sell-toggle"
import { FeesDialog } from "@/components/fees-dialog"
import type { Quote } from "@/types/exchange"

export default function ExchangePage() {
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  const [fromAmount, setFromAmount] = useState("")
  const [quote, setQuote] = useState<Quote | null>(null)
  const [fromCurrency, setFromCurrency] = useState(mode === "buy" ? "EUR" : "USDC")
  const [toCurrency, setToCurrency] = useState(mode === "buy" ? "USDC" : "EUR")
  const [paymentMethod, setPaymentMethod] = useState("SEPA")
  const [chain, setChain] = useState("ETH")

  useEffect(() => {
    if (fromAmount) {
      fetchQuote()
    }
  }, [fromAmount])

  const fetchQuote = async () => {
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAmount,
          fromCurrency,
          toCurrency,
          paymentMethodType: paymentMethod,
          chain,
        }),
      })
      console.log("at fetch quote")
      if (!response.ok) throw new Error("Failed to fetch quote")
      const data = await response.json()
      setQuote(data)
    } catch (error) {
      console.error("Error fetching quote:", error)
    }
  }

  const handleModeChange = (newMode: "buy" | "sell") => {
    setMode(newMode)
    setFromCurrency(newMode === "buy" ? "EUR" : "USDC")
    setToCurrency(newMode === "buy" ? "USDC" : "EUR")
    setFromAmount("")
    setQuote(null)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setFromAmount("")
    setQuote(null)
  }

  return (
    <Card className="bg-yellow-300 border-4 border-blue-600 p-4 rounded-lg shadow-lg">
      <div className="space-y-4">
        <BuySellToggle mode={mode} onChange={handleModeChange} />

        <div>
          <label className="block text-sm font-bold mb-1 text-blue-800">
            {mode === "buy" ? "You pay" : "You send"}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-grow bg-white border-2 border-red-500 text-black"
              placeholder="0.00"
            />
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-[120px] bg-green-400 border-2 border-purple-600 text-black">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {mode === "buy" ? (
                  <>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={swapCurrencies}
          className="w-full flex items-center justify-center py-2 bg-purple-500 text-white border-2 border-orange-500 hover:bg-purple-600"
        >
          <ArrowUpDown className="h-6 w-6" />
        </Button>

        <div className="space-y-4">
          <label className="block text-sm font-bold mb-1 text-blue-800">
            {mode === "buy" ? "You get" : "You receive"}
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={quote?.toAmount || "0.00"}
              readOnly
              className="flex-grow bg-white border-2 border-red-500 text-black"
            />
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-[120px] bg-green-400 border-2 border-purple-600 text-black">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {mode === "buy" ? (
                  <>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {mode === "buy" && (
          <div className="space-y-4">
            <label className="block text-sm font-bold mb-1 text-blue-800">Payment method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full bg-green-400 border-2 border-red-500 text-black">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEPA">SEPA</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {quote && (
          <div className="flex items-center justify-between p-3 bg-yellow-200 rounded-sm border-2 border-blue-600">
            <span className="text-black">
              1 {fromCurrency} = {Number(quote.rate).toFixed(4)} {toCurrency}
            </span>
            <FeesDialog mode={mode} fees={quote.fees} />
          </div>
        )}

        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-yellow-400"
          onClick={() => {
            /* Implement order creation */
          }}
        >
          {mode === "buy" ? "Buy now" : "Sell now"}
        </Button>
      </div>
    </Card>
  )
}

