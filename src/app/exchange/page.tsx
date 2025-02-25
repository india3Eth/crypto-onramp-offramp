"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet } from "lucide-react"
import { ExchangeToggle } from "@/components/exchange-toggle"
import { RefreshRateDisplay } from "@/components/refresh-rate-display"
import type { Quote, ExchangeFormData } from "@/types/exchange"
import { createQuote } from "@/app/actions/quote"

export default function ExchangePage() {
  const [mode, setMode] = useState<"onramp" | "offramp">("onramp")
  const [quoteDirection, setQuoteDirection] = useState<"buy" | "sell">("buy")
  const [fromAmount, setFromAmount] = useState("")
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<ExchangeFormData>({
    fromAmount: "",
    fromCurrency: "EUR",
    toCurrency: "USDC",
    paymentMethodType: "SEPA",
    chain: "ETH",
  })
  
  const toggleQuoteDirection = () => {
    setQuoteDirection((prev) => (prev === "buy" ? "sell" : "buy"))
  }
  
  // Handle input change
  const handleAmountChange = (value: string) => {
    setFromAmount(value)
    setFormData(prev => ({ ...prev, fromAmount: value }))
  }
  
  // Handle currency selection
  const handleFromCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, fromCurrency: value }))
  }
  
  const handleToCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, toCurrency: value }))
  }
  
  // Generate quote when form data changes
  useEffect(() => {
    const fetchQuote = async () => {
      // Only fetch if we have an amount and it's greater than 0
      if (!formData.fromAmount || parseFloat(formData.fromAmount) <= 0) {
        setQuote(null)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await createQuote(formData)
        setQuote(result)
      } catch (err) {
        console.error("Error fetching quote:", err)
        setError("Failed to get quote. Please try again.")
        setQuote(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Add a small delay to prevent too many API calls while typing
    const timer = setTimeout(() => {
      fetchQuote()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [formData])
  
  // Update payment method
  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentMethodType: value }))
  }

  // Set proper form values when mode changes
  useEffect(() => {
    if (mode === "onramp") {
      // Buying crypto: fiat -> crypto
      setFormData(prev => ({
        ...prev,
        fromCurrency: "EUR", // Example fiat
        toCurrency: "USDC", // Example crypto
      }))
    } else {
      // Selling crypto: crypto -> fiat
      setFormData(prev => ({
        ...prev,
        fromCurrency: "USDC", // Example crypto
        toCurrency: "EUR", // Example fiat
      }))
    }
  }, [mode])

  return (
    <div className="min-h-screen bg-gradient-radial from-gradient-start via-gradient-mid to-gradient-end p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Exchange Mode Toggle */}
        <div className="flex justify-center">
          <ExchangeToggle mode={mode} onChange={setMode} />
        </div>

        <Card className="p-6 border-brutal border-black shadow-brutal-lg bg-card">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{mode === "onramp" ? "Buy Crypto" : "Sell Crypto"}</h1>
              <Button
                variant="outline"
                size="icon"
                className="border-brutal border-black shadow-brutal-sm hover:shadow-brutal-md transition-shadow"
              >
                <Wallet size={20} />
              </Button>
            </div>

            {/* You pay/send section */}
            <div className="space-y-2">
              <label className="font-medium">{mode === "onramp" ? "You pay" : "You send"}</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="border-brutal border-black shadow-brutal-sm bg-white"
                  placeholder="0.00"
                />
                <Select 
                  value={formData.fromCurrency} 
                  onValueChange={handleFromCurrencyChange}
                >
                  <SelectTrigger className="w-[120px] border-brutal border-black shadow-brutal-sm bg-white">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {mode === "onramp" ? (
                      <>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exchange rate with refresh timer */}
            <RefreshRateDisplay 
              fromCurrency={formData.fromCurrency}
              toCurrency={formData.toCurrency}
              rate={quote?.rate}
              isLoading={isLoading}
              onRefresh={() => {
                setIsLoading(true);
                createQuote(formData)
                  .then(newQuote => {
                    setQuote(newQuote);
                    setIsLoading(false);
                  })
                  .catch(err => {
                    setError(String(err));
                    setIsLoading(false);
                  });
              }}
            />

            {/* You get/receive section */}
            <div className="space-y-2">
              <label className="font-medium">{mode === "onramp" ? "You get" : "You receive"}</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={isLoading ? "Loading..." : quote?.toAmount || "0.00"}
                  readOnly
                  className="border-brutal border-black shadow-brutal-sm bg-white"
                />
                <Select 
                  value={formData.toCurrency} 
                  onValueChange={handleToCurrencyChange}
                >
                  <SelectTrigger className="w-[120px] border-brutal border-black shadow-brutal-sm bg-white">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {mode === "onramp" ? (
                      <>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment/Payout method with fancy styling */}
            <div className="space-y-2">
              <label className="font-medium">{mode === "onramp" ? "Payment method" : "Payout method"}</label>
              <Select 
                value={formData.paymentMethodType} 
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger className="w-full justify-between border-brutal border-black shadow-brutal-sm bg-white">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-primary" />
                    {formData.paymentMethodType === "SEPA" ? "SEPA Transfer" : formData.paymentMethodType}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEPA">SEPA Transfer</SelectItem>
                  <SelectItem value="CARD">Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Display any errors */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive border-brutal border-destructive rounded-sm">
                {error}
              </div>
            )}

            {/* Rate info with gradient background */}
            <div className="flex items-center justify-between p-3 bg-yellow-200 rounded-sm border-brutal border-black shadow-brutal-sm">
              <span className="font-medium">1 {formData.fromCurrency} = {quote?.rate ? (1/parseFloat(quote.rate)).toFixed(6) : "0.0000"} {formData.toCurrency}</span>
              <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0">
                More
              </Button>
            </div>

            {/* Continue button with gradient animation */}
            <Button
              className="w-full bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end animate-gradient-flow text-white border-brutal border-black shadow-brutal-sm hover:shadow-brutal-md transition-shadow"
              disabled={!quote || isLoading}
            >
              {isLoading ? "Getting quote..." : "Continue"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}