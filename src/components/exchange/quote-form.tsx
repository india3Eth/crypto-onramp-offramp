"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Wallet, Clock, RefreshCw } from "lucide-react"
import type { QuoteRequest } from "@/types/exchange"
import { useCountdownTimer } from "@/hooks/use-countdown-timer"
import { CurrencySelect } from "@/components/exchange/currency-select"
import { FeeDisplay } from "@/components/exchange/fee-display"

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
  
  // State to keep track of filtered payment methods
  const [filteredPaymentMethods, setFilteredPaymentMethods] = useState<any[]>([])
  
  // Use our custom countdown timer hook
  const countdown = useCountdownTimer(
    15, // Initial time in seconds
    onCreateQuote, // Callback when timer reaches zero
    [quote] // Dependencies that reset the timer when changed
  )
  
  // Filter payment methods based on selected currency
  useEffect(() => {
    const currencyToCheck = mode === "buy" 
      ? formData.fromCurrency  // For buy flow, check fromCurrency (fiat)
      : formData.toCurrency    // For sell flow, check toCurrency (fiat)
    
    // Filter payment methods that support the selected currency
    const filtered = paymentMethods.filter(method => {
      // First, check if the method supports the current mode (buy/sell)
      const supportsMode = mode === "buy" 
        ? method.onRampSupported 
        : method.offRampSupported
      
      // Then check if it supports the selected currency using the new arrays
      const supportsCurrency = mode === "buy"
        ? Array.isArray(method.onramp) && method.onramp.includes(currencyToCheck)
        : Array.isArray(method.offramp) && method.offramp.includes(currencyToCheck)
      
      return supportsMode && supportsCurrency
    })
    
    setFilteredPaymentMethods(filtered)
    
    // If current payment method is not in filtered list, select the first available one
    if (filtered.length > 0 && !filtered.some(m => m.id === formData.paymentMethodType)) {
      onFormDataChange({
        ...formData,
        paymentMethodType: filtered[0].id
      })
    }
  }, [mode, formData.fromCurrency, formData.toCurrency, paymentMethods, onFormDataChange, formData])
  
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
      // No need to manually reset countdown - the hook will handle it
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

  // Format the exchange rate correctly
  const formatExchangeRate = () => {
    if (!quote || !quote.rate) return null;
    
    // Determine which way to display the rate based on the mode
    const rate = parseFloat(quote.rate);
    
    if (mode === "buy") {
      // For buying crypto with fiat: show how much crypto you get per unit of fiat
      return (
        <div className="font-medium text-sm">
          1 {formData.toCurrency} = <span className="text-blue-800 font-bold">{rate.toFixed(3)}</span> {formData.fromCurrency}
        </div>
      );
    } else {
      // For selling crypto for fiat: show how much fiat you get per unit of crypto
      return (
        <div className="font-medium text-sm">
          1 {formData.fromCurrency} = <span className="text-blue-800 font-bold">{rate.toFixed(3)}</span> {formData.toCurrency}
        </div>
      );
    }
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
      <CurrencySelect
        label={mode === "buy" ? "You Pay" : "You Send"}
        amount={formData.fromAmount}
        currency={formData.fromCurrency}
        options={mode === "buy" ? fiatOptions : cryptoOptions}
        onAmountChange={handleFromAmountChange}
        onCurrencyChange={handleFromCurrencyChange}
      />

      {/* Rate Display with improved styling for timer */}
      {quote && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            {/* Rate information with correct formatting */}
            {formatExchangeRate()}
            
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
          
          {/* Fee display */}
          {quote.fees && quote.fees.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <FeeDisplay fees={quote.fees} mode={mode} />
            </div>
          )}
        </div>
      )}

      {/* To currency (You Get/Receive) */}
      <CurrencySelect
        label={mode === "buy" ? "You Get" : "You Receive"}
        amount={formData.toAmount}
        currency={formData.toCurrency}
        options={mode === "buy" ? cryptoOptions : fiatOptions}
        onAmountChange={handleToAmountChange}
        onCurrencyChange={handleToCurrencyChange}
      />

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
            {filteredPaymentMethods.length > 0 ? (
              filteredPaymentMethods.map(method => (
                <SelectItem key={method.id} value={method.id}>
                  {method.id.replace(/_/g, ' ')}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                No payment methods available for this currency
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {filteredPaymentMethods.length === 0 && (
          <p className="text-xs text-red-500 mt-1">
            No payment methods support {mode === "buy" ? formData.fromCurrency : formData.toCurrency} for {mode === "buy" ? "buying" : "selling"}. Try another currency.
          </p>
        )}
      </div>
    </div>
  )
}