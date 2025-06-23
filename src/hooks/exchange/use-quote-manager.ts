"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { QuoteRequest } from "@/types/exchange"
import { createQuote } from "@/app/actions/exchange/quote"

interface UseQuoteManagerProps {
  formData: QuoteRequest
  lastModifiedField: "fromAmount" | "toAmount"
  isLoadingOptions: boolean
  setFormData: (data: QuoteRequest | ((prev: QuoteRequest) => QuoteRequest)) => void
}

export function useQuoteManager({
  formData,
  lastModifiedField,
  isLoadingOptions,
  setFormData
}: UseQuoteManagerProps) {
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null)
  const [quote, setQuote] = useState<{ rate?: string; fees?: Array<{ type: string; amount: string; currency: string }> } | null>(null)
  const [lastQuoteTimestamp, setLastQuoteTimestamp] = useState<number>(Date.now())
  const [hasInitialQuote, setHasInitialQuote] = useState(false)
  
  const previousParamsRef = useRef<string>('')
  
  // Prepare quote request based on last modified field
  const prepareQuoteRequest = useCallback(() => {
    const request = { ...formData }
    
    if (lastModifiedField === "fromAmount") {
      request.toAmount = ""
    } else {
      request.fromAmount = ""
    }
    
    return request
  }, [formData, lastModifiedField])
  
  // Validate if inputs are sufficient for a quote
  const hasValidInputs = useCallback(() => {
    const hasFromAmount = !!formData.fromAmount && parseFloat(formData.fromAmount) > 0;
    const hasToAmount = !!formData.toAmount && parseFloat(formData.toAmount) > 0;
    
    if (!hasFromAmount && !hasToAmount) return false;
    
    return !!(formData.fromCurrency && formData.toCurrency && formData.paymentMethodType);
  }, [formData])
  
  // Fetch quote from API
  const fetchQuote = useCallback(async () => {
    if (!hasValidInputs()) {
      return;
    }
    
    try {
      setIsLoadingQuote(true);
      setQuoteError(null);
      setApiErrorDetails(null);
      
      const quoteRequest = prepareQuoteRequest();
      const result = await createQuote(quoteRequest);
      
      setFormData(prev => ({
        ...prev,
        fromAmount: result.fromAmount,
        toAmount: result.toAmount
      }));
      
      setQuote(result);
      setLastQuoteTimestamp(Date.now());
      setHasInitialQuote(true);
      previousParamsRef.current = JSON.stringify(quoteRequest);
      
    } catch (error) {
      console.error("Error fetching quote:", error);
      
      let errorMessage = "Failed to get quote. Please check your inputs and try again.";
      let apiDetails = null;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes("API request failed:")) {
          const apiErrorMatch = error.message.match(/API request failed: (.+)/);
          if (apiErrorMatch && apiErrorMatch[1]) {
            apiDetails = apiErrorMatch[1];
          }
        }
      }
      
      setQuoteError(errorMessage);
      setApiErrorDetails(apiDetails);
    } finally {
      setIsLoadingQuote(false);
    }
  }, [hasValidInputs, prepareQuoteRequest, setFormData]);
  
  // Debounced API call for any input change
  useEffect(() => {
    if (!hasValidInputs() || isLoadingOptions) {
      return;
    }
    
    const quoteRequest = prepareQuoteRequest();
    const currentParams = JSON.stringify(quoteRequest);
    
    if (currentParams === previousParamsRef.current) {
      return;
    }
    
    // For initial load with valid default values, fetch quote immediately
    // Otherwise, use debounce for user input changes
    const isInitialLoad = !hasInitialQuote && currentParams !== '';
    const delay = isInitialLoad ? 100 : 2000;
    
    const debounceTimer = setTimeout(async () => {
      fetchQuote();
    }, delay); 
    
    return () => clearTimeout(debounceTimer);
  }, [
    formData.fromAmount, 
    formData.toAmount,
    formData.fromCurrency,
    formData.toCurrency,
    formData.paymentMethodType,
    formData.chain,
    isLoadingOptions,
    lastModifiedField,
    hasValidInputs,
    prepareQuoteRequest,
    fetchQuote,
    hasInitialQuote
  ]);
  
  const handleContinue = (mode: "buy" | "sell", onNavigate?: (url: string) => void) => {
    if (quote) {
      const quoteData = {
        ...quote,
        mode,
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
        fromAmount: formData.fromAmount,
        toAmount: formData.toAmount,
        paymentMethodType: formData.paymentMethodType,
        chain: formData.chain,
        rate: quote.rate ? parseFloat(quote.rate).toFixed(6) : "0",
        lastUpdated: Date.now(),
        fees: quote.fees || []
      };
      
      localStorage.setItem('currentQuote', JSON.stringify(quoteData));
      
      // Use the navigation callback if provided, otherwise fallback to window.location
      if (onNavigate) {
        onNavigate("/kyc-limit-check");
      } else {
        window.location.href = "/kyc-limit-check";
      }
    }
  };

  return {
    quote,
    isLoadingQuote,
    quoteError,
    apiErrorDetails,
    lastQuoteTimestamp,
    hasInitialQuote,
    fetchQuote,
    handleContinue
  }
}