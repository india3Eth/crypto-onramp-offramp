// src/hooks/use-payment-methods.ts
import { useState, useEffect } from "react";
import { formatErrorMessage } from "@/utils/common/error-handling";

// Define interfaces for API responses
interface PaymentMethodOption {
  id: string;
  onRampSupported: boolean;
  offRampSupported: boolean;
  availableFiatCurrencies: string[];
  onramp: string[]; 
  offramp: string[]; 
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
        setIsLoading(true);
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
        
        // Extract unique fiat currencies from the onramp/offramp arrays
        const uniqueFiatCurrencies = new Set<string>();
        
        data.paymentMethods.forEach((method: PaymentMethodOption) => {
          // Use the appropriate array based on mode
          const currencyArray = mode === "buy" 
            ? method.onramp || [] 
            : method.offramp || [];
            
          // Add all currencies to the set
          currencyArray.forEach(currency => uniqueFiatCurrencies.add(currency));
        });
        
        setFiatOptions(Array.from(uniqueFiatCurrencies).sort());
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        setError(formatErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, [mode]);
  
  return { paymentMethods, fiatOptions, isLoading, error };
}