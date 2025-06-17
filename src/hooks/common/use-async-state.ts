import { useState } from 'react';

/**
 * Common async state management hook
 * Provides data, loading, and error state pattern used across multiple hooks
 */
export function useAsyncState<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    data,
    setData,
    isLoading,
    setIsLoading,
    error,
    setError,
  };
}