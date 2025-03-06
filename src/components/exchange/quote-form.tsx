"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Wallet, Clock, RefreshCw } from "lucide-react"
import type { QuoteRequest } from "@/types/exchange"
import { useCountdownTimer } from "@/hooks/use-countdown-timer"

interface QuoteFormProps {
  mode: "buy" | "sell"
  formData: QuoteRequest
  onFormDataChange: (newFormData: QuoteRequest) => void
  onModeToggle: () => void
  fiatOptions: string[]
  cryptoOptions: any[]
  paymentMethods: any[]
  onCreateQuote: () => void
  quote: any | null
  isLoadingQuote: boolean
  onLastModifiedFieldChange: (field: "fromAmount" | "toAmount") => void
  lastQuoteTimestamp?: number
}

export function QuoteForm({
  mode,
  formData,
  onFormDataChange,
  onModeToggle,
  fiatOptions,
  cryptoOptions,
  paymentMethods,
  onCreateQuote,
  quote,
  isLoadingQuote,
  onLastModifiedFieldChange,
  lastQuoteTimestamp
}: QuoteFormProps) {
  const lastTimestampRef = useRef<number>(lastQuoteTimestamp || 0)
  
  // Use our custom countdown timer hook
  const countdown = useCountdownTimer(
    15, // Initial time in seconds
    onCreateQuote, // Callback when timer reaches zero
    [quote] // Dependencies that reset the timer when changed
  )
  
  // Reset timer when a new quote is received or refreshed
  useEffect(() => {
    // Check if we have a new quote by comparing timestamps
    if (lastQuoteTimestamp && lastQuoteTimestamp !== lastTimestampRef.current) {
      // Update our ref to the latest timestamp
      lastTimestampRef.current = lastQuoteTimestamp
    }
  }, [lastQuoteTimestamp])
  
  // Handle manual refresh - fixed to ensure it works
  const handleManualRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Call the quote refresh function directly
    if (!isLoadingQuote) {
      console.log("Manual refresh triggered")
      onCreateQuote()
    }
  }
  
  // Handle fromAmount input change
  const handleFromAmountChange = (value: string) => {
    onLastModifiedFieldChange("fromAmount")
    onFormDataChange({
      ...formData,
      fromAmount: value
    })
  }
  
  // Handle toAmount input change
  const handleToAmountChange = (value: string) => {
    onLastModifiedFieldChange("toAmount")
    onFormDataChange({
      ...formData,
      toAmount: value
    })
  }

  // Handle fromCurrency selection change
  const handleFromCurrencyChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fromCurrency: value
    })
  }

  // Handle toCurrency selection change
  const handleToCurrencyChange = (value: string) => {
    onFormDataChange({
      ...formData,
      toCurrency: value
    })
  }

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    onFormDataChange({
      ...formData,
      paymentMethodType: value
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with title and mode toggle button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{mode === "buy" ? "Buy Crypto" : "Sell Crypto"}</h2>
        
        {/* Mode toggle button (in top-right) */}
        <Button 
          onClick={onModeToggle}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] p-2 rounded-md"
          size="sm"
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          Switch to {mode === "buy" ? "Sell" : "Buy"}
        </Button>
      </div>

      {/* From currency (You Pay/Send) */}
      <div className="space-y-2">
        <label className="font-bold">{mode === "buy" ? "You Pay" : "You Send"}</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={formData.fromAmount}
            onChange={(e) => handleFromAmountChange(e.target.value)}
            className="flex-grow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
            placeholder="0.00"
          />
          <Select
            value={formData.fromCurrency}
            onValueChange={handleFromCurrencyChange}
          >
            <SelectTrigger className="w-[100px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
              {mode === "buy" ? (
                fiatOptions.map(currency => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))
              ) : (
                cryptoOptions.map(crypto => (
                  <SelectItem key={crypto.id} value={crypto.id}>
                    {crypto.id}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rate Display with improved styling for timer */}
      {quote && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            {/* Rate information */}
            {/* Reduced font size for better readability */}
            <div className="font-medium text-sm">
              1 {formData.fromCurrency} = <span className="text-blue-800 font-bold">{parseFloat(quote.rate).toFixed(3)}</span> {formData.toCurrency}
            </div>
            
            {/* Enhanced timer component with better contrast */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full px-3 py-1.5 shadow-md border-2 border-white flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{countdown}s</span>
              </div>
              
              {/* Separate button for refresh with clear hover state */}
              <button 
                onClick={handleManualRefresh}
                className={`bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md border-2 border-white flex items-center justify-center ${isLoadingQuote ? 'opacity-70' : 'opacity-100'}`}
                disabled={isLoadingQuote}
                aria-label="Refresh rate"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingQuote ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* To currency (You Get/Receive) */}
      <div className="space-y-2">
        <label className="font-bold">{mode === "buy" ? "You Get" : "You Receive"}</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={formData.toAmount}
            onChange={(e) => handleToAmountChange(e.target.value)}
            className="flex-grow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
            placeholder="0.00"
          />
          <Select
            value={formData.toCurrency}
            onValueChange={handleToCurrencyChange}
          >
            <SelectTrigger className="w-[100px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
              {mode === "buy" ? (
                cryptoOptions.map(crypto => (
                  <SelectItem key={crypto.id} value={crypto.id}>
                    {crypto.id}
                  </SelectItem>
                ))
              ) : (
                fiatOptions.map(currency => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))
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
          onValueChange={handlePaymentMethodChange}
        >
          <SelectTrigger className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>{formData.paymentMethodType}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
            {paymentMethods
              .filter(method => mode === "buy" ? method.onRampSupported : method.offRampSupported)
              .map(method => (
                <SelectItem key={method.id} value={method.id}>
                  {method.id.replace(/_/g, ' ')}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}