import { useState, useEffect, useCallback, useRef } from 'react';
import { refreshKycStatus } from '@/app/actions/kyc/kyc-status';

interface UseProfileKycProps {
  user: any;
  refreshUser: () => Promise<void>;
  enabled?: boolean;
}

export function useProfileKyc({ user, refreshUser, enabled = true }: UseProfileKycProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  
  // Use refs to prevent multiple simultaneous calls
  const isRefreshingRef = useRef(false);
  const lastCustomerIdRef = useRef<string | null>(null);
  const initializationPromiseRef = useRef<Promise<any> | null>(null);

  // Function to refresh KYC status
  const refreshKyc = useCallback(async (isManual = false) => {
    if (!user?.customerId || (!enabled && !isManual)) {
      return { success: false, message: 'User not ready or refresh disabled' };
    }

    // Prevent multiple simultaneous calls
    if (isRefreshingRef.current && !isManual) {
      console.log('KYC refresh already in progress, skipping...');
      return { success: false, message: 'Refresh already in progress' };
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      console.log(`${isManual ? 'Manual' : 'Automatic'} KYC status refresh initiated for customer:`, user.customerId);
      
      const result = await refreshKycStatus();
      
      if (result.success) {
        console.log('KYC status refreshed successfully:', {
          status: result.kycStatus,
          level: result.kycLevel,
          limits: result.kycLimits
        });
        
        // Refresh user data to get updated KYC status from database
        await refreshUser();
        setLastRefreshTime(Date.now());
        
        return result;
      } else {
        console.warn('KYC status refresh failed:', result.message);
        setError(result.message);
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh KYC status';
      console.error('Error refreshing KYC status:', error);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [user?.customerId, refreshUser, enabled]);

  // Auto-refresh on profile page load - only once per customer
  useEffect(() => {
    const initializeKyc = async () => {
      // Check if user has changed or if we haven't initialized for this customer
      const currentCustomerId = user?.customerId;
      
      if (!currentCustomerId) {
        setHasInitialized(true);
        return;
      }

      // If customer changed, reset state
      if (lastCustomerIdRef.current !== currentCustomerId) {
        lastCustomerIdRef.current = currentCustomerId;
        setHasInitialized(false);
        setError(null);
        setLastRefreshTime(null);
      }

      // Only initialize if not already done and enabled
      if (!hasInitialized && enabled && !isRefreshingRef.current) {
        // If there's already an initialization in progress, wait for it
        if (initializationPromiseRef.current) {
          await initializationPromiseRef.current;
          return;
        }

        console.log('Initializing profile KYC refresh for customer:', currentCustomerId);
        
        // Store the promise to prevent multiple initialization calls
        initializationPromiseRef.current = refreshKyc(false).finally(() => {
          initializationPromiseRef.current = null;
          setHasInitialized(true);
        });

        await initializationPromiseRef.current;
      }
    };

    initializeKyc();
  }, [user?.customerId, enabled, hasInitialized, refreshKyc]);

  // Manual refresh function for user-triggered refreshes
  const manualRefresh = useCallback(async () => {
    // Manual refresh should always work, even if auto-refresh is disabled
    return await refreshKyc(true);
  }, [refreshKyc]);

  return {
    isRefreshing,
    error,
    hasInitialized,
    lastRefreshTime,
    refreshKyc: manualRefresh,
    clearError: () => setError(null)
  };
}