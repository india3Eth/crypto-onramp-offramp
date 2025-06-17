import { useState, useEffect } from 'react';
import { TransactionStatus } from '@/types/exchange/webhook';

/**
 * Hook to fetch transaction details by reference ID
 */
export function useTransactionDetails(referenceId?: string) {
  const [transaction, setTransaction] = useState<TransactionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!referenceId) return;

    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/transactions/${referenceId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transaction details');
        }

        const data = await response.json();
        setTransaction(data.transaction);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTransaction(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [referenceId]);

  return {
    transaction,
    isLoading,
    error,
  };
}

/**
 * Get blockchain explorer URL for a transaction hash
 */
export function getExplorerUrl(txHash: string, networkId: string): string {
  const explorers: Record<string, string> = {
    '1': 'https://etherscan.io/tx/', // Ethereum Mainnet
    '56': 'https://bscscan.com/tx/', // BSC Mainnet  
    '137': 'https://polygonscan.com/tx/', // Polygon
    '43114': 'https://snowtrace.io/tx/', // Avalanche
    '5': 'https://goerli.etherscan.io/tx/', // Goerli Testnet
  };

  const baseUrl = explorers[networkId] || explorers['1']; // Default to Ethereum
  return `${baseUrl}${txHash}`;
}

/**
 * Format crypto amount for display
 */
export function formatCryptoAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${amount} ${currency}`;
  
  // Show more decimals for smaller amounts
  const decimals = num < 1 ? 6 : num < 100 ? 4 : 2;
  return `${num.toFixed(decimals)} ${currency}`;
}

/**
 * Format fiat amount for display
 */
export function formatFiatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${amount} ${currency}`;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}