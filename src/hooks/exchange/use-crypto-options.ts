import { useState, useEffect } from "react";

interface CryptoOption {
  id: string;
  network?: string;
  chain?: string;
  paymentMethods: string[];
  supportedFiatCurrencies: string[];
}

export function useCryptoOptions(mode: "buy" | "sell") {
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCryptoOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const endpoint = mode === "buy" ? "/api/crypto/onramp" : "/api/crypto/offramp";
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch crypto options: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch crypto options");
        }
        
        setCryptoOptions(data.cryptos || []);
      } catch (err) {
        console.error("Error fetching crypto options:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCryptoOptions();
  }, [mode]);
  
  return { cryptoOptions, isLoading, error };
}