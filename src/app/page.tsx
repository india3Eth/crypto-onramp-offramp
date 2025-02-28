"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Wallet, RefreshCw, Clock, AlertCircle } from "lucide-react"
import type { Quote, ExchangeFormData } from "@/types/exchange"
import { useQuote } from "@/hooks/use-quote"

export default function HomePage() {
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  const [countdown, setCountdown] = useState(10)
  const [formData, setFormData] = useState<ExchangeFormData>({
    fromAmount: "50",
    fromCurrency: "USD",
    toCurrency: "USDT",
    paymentMethodType: "CARD",
    chain: "BEP20",
  })
  
  // Use the custom hook for quote fetching
  const { quote, isLoading, error, refreshQuote } = useQuote(formData)
  
  // Handle amount input change
  const handleAmountChange = (value: string) => {
    setFormData(prev => ({ ...prev, fromAmount: value }))
  }
  
  // Handle swapping currencies and toggle between buy/sell
  const handleSwapCurrencies = () => {
    // Toggle mode between buy and sell
    const newMode = mode === "buy" ? "sell" : "buy"
    setMode(newMode)
    
    // Set currencies based on mode
    if (newMode === "buy") {
      setFormData(prev => ({
        ...prev,
        fromCurrency: "USD",
        toCurrency: "USDT",
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        fromCurrency: "USDT",
        toCurrency: "EUR",
      }))
    }
  }
  
  // Set up countdown timer for quote refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshQuote()
          return 10
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [refreshQuote])
  

  return (
    <div className="flex flex-col gap-4">
      {/* Exchange card */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{mode === "buy" ? "Buy Crypto" : "Sell Crypto"}</h2>
            <Wallet className="h-6 w-6" />
          </div>

          {/* From currency */}
          <div className="space-y-2">
            <label className="font-bold">{mode === "buy" ? "You Pay" : "You Send"}</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={formData.fromAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="flex-grow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
                placeholder="0.00"
              />
              <Select
                value={formData.fromCurrency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, fromCurrency: value }))}
              >
                <SelectTrigger className="w-[100px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                  {mode === "buy" ? (
                    <>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom swap button with timer and rate display */}
          <div className="relative flex items-center border-2 border-black rounded-md p-2">
            {/* Left side - Toggle button */}
            <button 
              onClick={handleSwapCurrencies}
              className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 transition-all"
            >
              <ArrowUpDown className="h-6 w-6" />
            </button>
            
            {/* Middle - Rate display */}
            <div className="flex-grow text-center">
              {error ? (
                <div className="flex items-center justify-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Error getting quote</span>
                </div>
              ) : isLoading ? (
                <span className="text-sm font-medium">Loading rates...</span>
              ) : quote ? (
                <span className="text-sm font-medium">
                  1 {formData.fromCurrency} = {Number(quote.rate).toFixed(4)} {formData.toCurrency}
                </span>
              ) : (
                <span className="text-sm font-medium">
                  <button 
                    onClick={refreshQuote}
                    className="text-blue-500 hover:underline flex items-center justify-center mx-auto"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Get quote
                  </button>
                </span>
              )}
            </div>
            
            {/* Right side - Timer */}
            <div className="bg-yellow-300 px-3 py-1 rounded-full border-2 border-black flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">{countdown}s</span>
              <button 
                onClick={() => {
                  refreshQuote()
                  setCountdown(10)
                }}
                className="ml-1"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* To currency */}
          <div className="space-y-2">
            <label className="font-bold">{mode === "buy" ? "You Get" : "You Receive"}</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={isLoading ? "Loading..." : error ? "Error" : quote?.toAmount || "0.00"}
                readOnly
                className="flex-grow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] bg-gray-100"
              />
              <Select
                value={formData.toCurrency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, toCurrency: value }))}
              >
                <SelectTrigger className="w-[100px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                  {mode === "buy" ? (
                    <>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <label className="font-bold">{mode === "buy" ? "Payment Method" : "Payout Method"}</label>
            <Select
              value={formData.paymentMethodType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethodType: value }))}
            >
              <SelectTrigger className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>{formData.paymentMethodType === "SEPATRANSFER" ? "SEPA Transfer" : "Card Payment"}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                <SelectItem value="SEPATRANSFER">SEPA Transfer</SelectItem>
                <SelectItem value="CARD">Card Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md">
              {error}
            </div>
          )}

          {/* Continue button */}
          <Button
            className={`w-full text-white font-bold py-3 transition-transform active:translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] ${
              mode === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
            disabled={!quote || isLoading}
            onClick={() => window.location.href = "/login"}
          >
            {isLoading ? "Getting quote..." : "Continue"}
          </Button>
        </div>
      </Card>
    </div>
  )
}