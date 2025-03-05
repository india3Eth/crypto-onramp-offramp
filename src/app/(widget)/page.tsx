"use client"

import { useState, useEffect, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Wallet, RefreshCw, Clock, AlertCircle, Download, Loader2 } from "lucide-react"
import type { ExchangeFormData } from "@/types/exchange"
import { createQuote } from "@/app/actions/quote"
import { fetchAndStoreConfigs } from "@/app/actions/config"

// Custom hooks for API data
import { useCryptoOptions } from "@/hooks/use-crypto-options"
import { usePaymentMethods } from "@/hooks/use-payment-methods"

export default function HomePage() {
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  
  // Track which field was last modified (fromAmount or toAmount)
  const [lastModifiedField, setLastModifiedField] = useState<"fromAmount" | "toAmount">("fromAmount")
  
  // Single combined state for form data
  const [formData, setFormData] = useState<ExchangeFormData>({
    fromAmount: "50",
    toAmount: "",
    fromCurrency: "USD",
    toCurrency: "USDT",
    paymentMethodType: "CARD",
    chain: "BEP20",
  })
  
  // UI states
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quote, setQuote] = useState<any>(null)
  const [countdown, setCountdown] = useState(10)
  
  // Config update state
  const [isPending, startTransition] = useTransition()
  const [configResult, setConfigResult] = useState<{ success?: boolean; message?: string } | null>(null)
  
  // Use custom hooks for API data
  const { cryptoOptions, isLoading: isLoadingCrypto, error: cryptoError } = useCryptoOptions(mode === "buy" ? "buy" : "sell")
  const { paymentMethods, fiatOptions, isLoading: isLoadingPayments, error: paymentsError } = usePaymentMethods(mode === "buy" ? "buy" : "sell")
  
  const isLoadingOptions = isLoadingCrypto || isLoadingPayments
  const optionsError = cryptoError || paymentsError
  
  // Prepare quote request based on last modified field
  const prepareQuoteRequest = () => {
    const request = { ...formData }
    
    // Clear the field that wasn't last modified
    if (lastModifiedField === "fromAmount") {
      request.toAmount = ""
    } else {
      request.fromAmount = ""
    }
    
    return request
  }
  
  // Debounced API call for any input change
  useEffect(() => {
    // Skip if we don't have valid inputs yet
    if (
      (!formData.fromAmount && !formData.toAmount) || 
      !formData.fromCurrency || 
      !formData.toCurrency || 
      !formData.paymentMethodType ||
      isLoadingOptions
    ) {
      return;
    }
    
    const debounceTimer = setTimeout(async () => {
      try {
        setIsLoadingQuote(true);
        setQuoteError(null);
        
        // Prepare request with only one amount field based on what was last modified
        const quoteRequest = prepareQuoteRequest();
        
        // Call API with prepared request
        const result = await createQuote(quoteRequest);
        
        // Update the form with the response data
        setFormData(prev => ({
          ...prev,
          fromAmount: result.fromAmount,
          toAmount: result.toAmount
        }));
        
        // Store the full quote
        setQuote(result);
        
        // Reset countdown
        setCountdown(10);
        
      } catch (error) {
        console.error("Error fetching quote:", error);
        setQuoteError(error instanceof Error ? error.message : "Failed to get quote");
      } finally {
        setIsLoadingQuote(false);
      }
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(debounceTimer);
  }, [
    formData.fromAmount, 
    formData.toAmount,
    formData.fromCurrency,
    formData.toCurrency,
    formData.paymentMethodType,
    formData.chain,
    isLoadingOptions,
    lastModifiedField
  ]);
  
  // Set up countdown timer for quote refresh
  useEffect(() => {
    if (!quote) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshQuote();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quote]);
  
  // Refresh quote manually
  const refreshQuote = async () => {
    try {
      setIsLoadingQuote(true);
      setQuoteError(null);
      
      // Prepare request with only one amount field based on what was last modified
      const quoteRequest = prepareQuoteRequest();
      
      const result = await createQuote(quoteRequest);
      
      setFormData(prev => ({
        ...prev,
        fromAmount: result.fromAmount,
        toAmount: result.toAmount
      }));
      
      setQuote(result);
      setCountdown(10);
      
    } catch (error) {
      console.error("Error refreshing quote:", error);
      setQuoteError(error instanceof Error ? error.message : "Failed to get quote");
    } finally {
      setIsLoadingQuote(false);
    }
  };
  
  // Handle fromAmount input change
  const handleFromAmountChange = (value: string) => {
    setLastModifiedField("fromAmount");
    setFormData(prev => ({
      ...prev,
      fromAmount: value,
      // Don't clear toAmount here, let the API handle it
    }));
  }
  
  // Handle toAmount input change
  const handleToAmountChange = (value: string) => {
    setLastModifiedField("toAmount");
    setFormData(prev => ({
      ...prev,
      toAmount: value,
      // Don't clear fromAmount here, let the API handle it
    }));
  }
  
  // Handle swapping currencies and toggle between buy/sell
  const handleSwapCurrencies = () => {
    // Toggle mode between buy and sell
    const newMode = mode === "buy" ? "sell" : "buy"
    setMode(newMode)
    
    // Reset form data based on new mode
    if (newMode === "buy") {
      // For onramp (buy): default to entering fiat amount
      setFormData(prev => ({
        ...prev,
        fromAmount: "50",
        toAmount: "",
        fromCurrency: fiatOptions[0] || "USD",
        toCurrency: "USDT",
        paymentMethodType: "CARD",
      }))
      setLastModifiedField("fromAmount");
    } else {
      // For offramp (sell): default to entering fiat amount to receive
      setFormData(prev => ({
        ...prev,
        fromAmount: "",
        toAmount: "50",
        fromCurrency: "USDT",
        toCurrency: fiatOptions[0] || "USD",
        paymentMethodType: "SEPA",
      }))
      setLastModifiedField("toAmount");
    }
  }
  
  // Handle update configs button click
  const handleUpdateConfigs = () => {
    setConfigResult(null)
    startTransition(async () => {
      const result = await fetchAndStoreConfigs()
      setConfigResult(result)
    })
  }
  
  // Update default currency values when options are loaded
  useEffect(() => {
    // Skip if no options loaded yet or if loading
    if (isLoadingOptions || fiatOptions.length === 0 || cryptoOptions.length === 0) {
      return
    }
    
    // Set defaults based on mode
    if (mode === "buy") {
      setFormData(prev => ({
        ...prev,
        // Use the first available options if current selections are not available
        fromCurrency: fiatOptions.includes(prev.fromCurrency) ? prev.fromCurrency : fiatOptions[0],
        toCurrency: cryptoOptions.find(c => c.id === prev.toCurrency) ? prev.toCurrency : cryptoOptions[0]?.id || "USDT",
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        fromCurrency: cryptoOptions.find(c => c.id === prev.fromCurrency) ? prev.fromCurrency : cryptoOptions[0]?.id || "BTC",
        toCurrency: fiatOptions.includes(prev.toCurrency) ? prev.toCurrency : fiatOptions[0],
      }))
    }
  }, [isLoadingOptions, fiatOptions, cryptoOptions, mode])

  return (
    <div className="flex flex-col gap-4">
      {/* Exchange card */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{mode === "buy" ? "Buy Crypto" : "Sell Crypto"}</h2>
            <Wallet className="h-6 w-6" />
          </div>

          {/* Loading state for options */}
          {isLoadingOptions && (
            <div className="flex justify-center items-center p-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                <p className="text-gray-500">Loading exchange options...</p>
              </div>
            </div>
          )}

          {/* Options error */}
          {optionsError && (
            <div className="p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>{optionsError}</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2 border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoadingOptions && !optionsError && (
            <>
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
                    onValueChange={(value) => {
                      setFormData((prev) => ({ 
                        ...prev, 
                        fromCurrency: value
                      }))
                      // When currency changes, maintain the last modified field
                      // No need to clear either amount
                    }}
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
                  {quoteError ? (
                    <div className="flex items-center justify-center text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Error getting quote</span>
                    </div>
                  ) : isLoadingQuote ? (
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
                    onClick={refreshQuote}
                    className="ml-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              </div>

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
                    onValueChange={(value) => {
                      setFormData((prev) => ({ 
                        ...prev, 
                        toCurrency: value
                      }))
                      // When currency changes, maintain the last modified field
                      // No need to clear either amount
                    }}
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
                  onValueChange={(value) => setFormData((prev) => ({ 
                    ...prev, 
                    paymentMethodType: value
                  }))}
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

              {/* Error display */}
              {quoteError && (
                <div className="p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md">
                  {quoteError}
                </div>
              )}

              {/* Continue button */}
              <Button
                className={`w-full text-white font-bold py-3 transition-transform active:translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] ${
                  mode === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
                disabled={!quote || isLoadingQuote}
                onClick={() => window.location.href = "/login"}
              >
                {isLoadingQuote ? "Getting quote..." : "Continue"}
              </Button>
            </>
          )}
          
          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-4"></div>
          
          {/* Update configs button and status */}
          <div className="space-y-3">
            <Button
              onClick={handleUpdateConfigs}
              disabled={isPending}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 transition-transform active:translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
            >
              {isPending ? (
                <span className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating Configs...
                </span>
              ) : (
                <span className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Update Configurations
                </span>
              )}
            </Button>
            
            {/* Config update result message */}
            {configResult && (
              <div className={`p-3 border-2 rounded-md ${
                configResult.success 
                  ? "bg-green-100 text-green-600 border-green-600" 
                  : "bg-red-100 text-red-600 border-red-600"
              }`}>
                <p className="text-sm">{configResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}