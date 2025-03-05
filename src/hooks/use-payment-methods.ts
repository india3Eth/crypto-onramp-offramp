// src/hooks/use-payment-methods.ts
import { useState, useEffect } from "react";

// Define interfaces for API responses
interface PaymentMethodOption {
  id: string;
  onRampSupported: boolean;
  offRampSupported: boolean;
  availableFiatCurrencies: string[];
}

interface ApiResponse<T> {
  success: boolean;
  count: number;
  error?: string;
  paymentMethods: T[];
}

/**
 * Custom hook to fetch payment methods based on the exchange mode (buy/sell)
 */
export function usePaymentMethods(mode: "buy" | "sell") {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [fiatOptions, setFiatOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        // Only set loading if we don't already have payment methods
        if (paymentMethods.length === 0) {
          setIsLoading(true);
        }
        setError(null);
        
        const response = await fetch(`/api/crypto/payment-methods?type=${mode === "buy" ? "onramp" : "offramp"}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
        }
        
        const data = await response.json() as ApiResponse<PaymentMethodOption>;
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch payment methods");
        }
        
        setPaymentMethods(data.paymentMethods || []);
        
        // Extract unique fiat currencies from payment methods
        const uniqueFiatCurrencies = new Set<string>();
        data.paymentMethods.forEach((method: { availableFiatCurrencies: string[] }) => {
          method.availableFiatCurrencies.forEach(currency => uniqueFiatCurrencies.add(currency));
        });
        
        setFiatOptions(Array.from(uniqueFiatCurrencies).sort());
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, [mode, paymentMethods.length]);
  
  return { paymentMethods, fiatOptions, isLoading, error };
}