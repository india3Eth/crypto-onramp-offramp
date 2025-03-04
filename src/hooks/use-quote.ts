import { useState, useEffect, useCallback } from "react";
import type { QuoteRequest, Quote } from "@/types/exchange";
import { createQuote } from "@/app/actions/quote";

interface UseQuoteOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useQuote(
  formData: QuoteRequest, 
  options: UseQuoteOptions = {}
) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  // Set default options
  const { 
    autoRefresh = true,
    refreshInterval = 30 
  } = options;
  
  // Function to fetch a new quote
  const fetchQuote = useCallback(async () => {
    // Only fetch if we have an amount and it's greater than 0
    if (!formData.fromAmount || parseFloat(formData.fromAmount) <= 0) {
      setQuote(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createQuote(formData);
      setQuote(result);
   
    } catch (err) {
      console.error("Error fetching quote:", err);
      setError(err instanceof Error 
        ? err.message 
        : "Failed to get quote. Please try again.");
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [formData, refreshInterval]);
  
  // Manual refresh function
  const refreshQuote = useCallback(() => {
    fetchQuote();
  
  }, [fetchQuote, refreshInterval]);
  
  // Auto-fetch quote when form data changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData, fetchQuote]);
  

  
  return {
    quote,
    isLoading,
    error,
    refreshInterval,
    refreshQuote
  };
}