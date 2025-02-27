import { useState, useEffect, useCallback } from 'react';
import type { 
  ConfigResponse, 
  Country, 
  PaymentMethod, 
  CryptoCurrency 
} from '@/services/config-service';

export function useConfig() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/config');
      
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error('Config fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Force refresh config
  const refreshConfig = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/config/refresh', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh configuration');
      }
      
      const data = await response.json();
      setConfig(data.config);
      return true;
    } catch (err) {
      console.error('Config refresh error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment methods for a specific country
  const getPaymentMethodsForCountry = useCallback(async (countryCode: string): Promise<PaymentMethod[]> => {
    try {
      const response = await fetch(`/api/config/payments?country=${countryCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      return response.json();
    } catch (err) {
      console.error('Payment methods error:', err);
      throw err;
    }
  }, []);

  // Get supported cryptocurrencies
  const getSupportedCryptocurrencies = useCallback(async (): Promise<CryptoCurrency[]> => {
    try {
      const response = await fetch('/api/config/cryptocurrencies');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrencies');
      }
      
      return response.json();
    } catch (err) {
      console.error('Cryptocurrencies error:', err);
      throw err;
    }
  }, []);

  // Get supported countries
  const getSupportedCountries = useCallback(async (): Promise<Country[]> => {
    try {
      const response = await fetch('/api/config/countries');
      
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      
      return response.json();
    } catch (err) {
      console.error('Countries error:', err);
      throw err;
    }
  }, []);

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    refreshConfig,
    getPaymentMethodsForCountry,
    getSupportedCryptocurrencies,
    getSupportedCountries
  };
}