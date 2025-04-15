"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { QuoteRequest } from "@/types/exchange"
import { createQuote } from "@/app/actions/quote"

// Custom hooks for API data
import { useCryptoOptions } from "@/hooks/use-crypto-options"
import { usePaymentMethods } from "@/hooks/use-payment-methods"

// New components
import { QuoteForm } from "@/components/exchange/quote-form"
import { ConfigRefresher } from "@/components/admin/config-refresher"
import { ErrorDisplay } from "@/components/ui/error-display"

export default function HomePage() {
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  
  // Track which field was last modified (fromAmount or toAmount)
  const [lastModifiedField, setLastModifiedField] = useState<"fromAmount" | "toAmount">("fromAmount")
  
  // Store previous parameters to avoid unnecessary API calls
  const previousParamsRef = useRef<string>('');
  
  // Single combined state for form data
  const [formData, setFormData] = useState<QuoteRequest>({
    fromAmount: "50",
    toAmount: "",
    fromCurrency: "USD",
    toCurrency: "USDT",
    paymentMethodType: "CARD",
    chain: "",
  })
  
  // UI states
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quote, setQuote] = useState<any>(null)
  // Track the timestamp of the last quote update to trigger timer resets
  const [lastQuoteTimestamp, setLastQuoteTimestamp] = useState<number>(Date.now())
  
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
  
  // Validate if inputs are sufficient for a quote
  const hasValidInputs = () => {
    // Must have either fromAmount or toAmount, and both must not be 0
    const hasFromAmount = !!formData.fromAmount && parseFloat(formData.fromAmount) > 0;
    const hasToAmount = !!formData.toAmount && parseFloat(formData.toAmount) > 0;
    
    if (!hasFromAmount && !hasToAmount) return false;
    
    // Must have currencies and payment method
    return !!(formData.fromCurrency && formData.toCurrency && formData.paymentMethodType);
  }
  
  // Debounced API call for any input change
  useEffect(() => {
    // Skip if we don't have valid inputs yet or still loading options
    if (!hasValidInputs() || isLoadingOptions) {
      return;
    }
    
    // Create a representation of current parameters for comparison
    const quoteRequest = prepareQuoteRequest();
    const currentParams = JSON.stringify(quoteRequest);
    
    // Skip if parameters haven't changed
    if (currentParams === previousParamsRef.current) {
      return;
    }
    
    const debounceTimer = setTimeout(async () => {
      fetchQuote();
    }, 2000); 
    
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
    
    // Reset previous params to force a quote fetch after mode change
    previousParamsRef.current = '';
  }


  const handleContinue = () => {
    if (quote) {
      // Save current quote to localStorage with all necessary details
      const quoteData = {
        ...quote,
        mode, // 'buy' or 'sell'
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
        fromAmount: formData.fromAmount,
        toAmount: formData.toAmount,
        paymentMethodType: formData.paymentMethodType,
        chain: formData.chain,
        rate: parseFloat(quote.rate).toFixed(6),
        lastUpdated: Date.now(), // Add timestamp for the timer
        fees: quote.fees || []
      };
      
      localStorage.setItem('currentQuote', JSON.stringify(quoteData));
      
      window.location.href = "/wallet-address";
    }
  };
  
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
    
    // Reset previous params to force a quote fetch after currency options change
    previousParamsRef.current = '';
  }, [isLoadingOptions, fiatOptions, cryptoOptions, mode])

  // Fetch quote from API
  const fetchQuote = async () => {
    // Skip if inputs are invalid
    if (!hasValidInputs()) {
      return;
    }
    
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
      
      // Update timestamp to trigger timer reset
      setLastQuoteTimestamp(Date.now());
      
      // Update the previous parameters ref
      previousParamsRef.current = JSON.stringify(quoteRequest);
      
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuoteError(error instanceof Error 
        ? error.message 
        : "Failed to get quote. Please check your inputs and try again.");
    } finally {
      setIsLoadingQuote(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Exchange card */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-4">
        <div className="space-y-6">
          {/* Loading state for options */}
          {isLoadingOptions && (
            <div className="flex justify-center items-center p-8">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin text-blue-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
                <p className="text-gray-500">Loading exchange options...</p>
              </div>
            </div>
          )}

          {/* Options error */}
          {optionsError && (
            <ErrorDisplay 
              message={optionsError} 
              onRetry={() => window.location.reload()} 
            />
          )}

          {!isLoadingOptions && !optionsError && (
            <>
              {/* Quote Form Component */}
              <QuoteForm
                mode={mode}
                formData={formData}
                onFormDataChange={setFormData}
                onModeToggle={handleSwapCurrencies}
                fiatOptions={fiatOptions}
                cryptoOptions={cryptoOptions}
                paymentMethods={paymentMethods}
                onCreateQuote={fetchQuote}
                quote={quote}
                isLoadingQuote={isLoadingQuote}
                onLastModifiedFieldChange={setLastModifiedField}
                lastQuoteTimestamp={lastQuoteTimestamp}
              />

              {/* Error display */}
              {quoteError && (
                <ErrorDisplay message={quoteError} />
              )}

              {/* Continue button */}
              <Button
                className={`w-full text-white font-bold py-3 transition-transform active:translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] ${mode === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                  }`}
                disabled={!quote || isLoadingQuote}
                onClick={handleContinue}
              >
                {isLoadingQuote ? "Getting quote..." : "Continue"}
              </Button>
            </>
          )}
          
          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-4"></div>
          
          {/* Config Refresher Component */}
          <ConfigRefresher />
        </div>
      </Card>
    </div>
  )
}