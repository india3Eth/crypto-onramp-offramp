import { useState, useEffect, useCallback } from 'react';
import type { Quote, ExchangeFormData } from '@/types/exchange';

interface UseQuotesProps {
  mode: 'onramp' | 'offramp';
  initialData?: ExchangeFormData;
  refreshInterval?: number;
}

export function useQuotes({
  mode,
  initialData,
  refreshInterval = 10000, // 10 seconds default
}: UseQuotesProps) {
  const [formData, setFormData] = useState<ExchangeFormData>(
    initialData || {
      fromAmount: '',
      fromCurrency: mode === 'onramp' ? 'USD' : 'USDC',
      toCurrency: mode === 'onramp' ? 'USDC' : 'USD',
      paymentMethodType: 'SEPA',
      chain: 'ETH', // Default chain
    }
  );
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(refreshInterval / 1000);

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
      const endpoint = mode === 'onramp' ? '/api/quotes/onramp' : '/api/quotes/offramp';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get quote');
      }

      const result = await response.json();
      setQuote(result);
      
      // Reset countdown
      setCountdown(refreshInterval / 1000);
    } catch (err) {
      console.error(`Error fetching ${mode} quote:`, err);
      setError(err instanceof Error ? err.message : 'Failed to get quote');
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [formData, mode, refreshInterval]);

  // Update form data
  const updateFormData = (data: Partial<ExchangeFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }));
  };

  // Set up auto-refresh timer
  useEffect(() => {
    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchQuote();
          return refreshInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup
    return () => {
      clearInterval(countdownTimer);
    };
  }, [fetchQuote, refreshInterval]);

  // Fetch quote when form data changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, fetchQuote]);

  // Toggle between onramp and offramp
  const toggleMode = useCallback(() => {
    // Swap currencies based on current mode
    const newMode = mode === 'onramp' ? 'offramp' : 'onramp';
    
    setFormData(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
    }));
    
    // Clear existing quote
    setQuote(null);
  }, [mode]);

  return {
    mode,
    formData,
    quote,
    isLoading,
    error,
    countdown,
    updateFormData,
    refreshQuote: fetchQuote,
    toggleMode,
  };
}