import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  email: string;
  isVerified: boolean;
  customerId?: string;
  role?: string;
  kycStatus?: string;
  kycData?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
    countryOfResidence?: string;
    submissionId?: string;
    statusReason?: string;
    kycLevel?: string;
  };
}

interface UseAuthProps {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuth({ 
  redirectTo = '', 
  redirectIfFound = false 
}: UseAuthProps = {}) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  
  // Use refs to prevent multiple simultaneous calls
  const isFetchingRef = useRef(false);
  const initializationPromiseRef = useRef<Promise<any> | null>(null);

  // Memoized function to fetch user data
  const fetchUser = useCallback(async (isRefresh = false) => {
    // Prevent multiple simultaneous calls unless it's a refresh
    if (isFetchingRef.current && !isRefresh) {
      return;
    }

    isFetchingRef.current = true;

    try {
      if (!isRefresh) {
        setLoading(true);
      }
      
      const res = await fetch('/api/auth/user');
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        
        // Redirect if needed
        if (redirectTo && redirectIfFound) {
          router.push(redirectTo);
        }
      } else {
        // User is not authenticated
        setUser(null);
        
        // Redirect if needed
        if (redirectTo && !redirectIfFound) {
          router.push(redirectTo);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setUser(null);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setInitialized(true);
    }
  }, [redirectIfFound, redirectTo, router]);

  useEffect(() => {
    if (!initialized) {
      // If there's already an initialization in progress, wait for it
      if (initializationPromiseRef.current) {
        return;
      }

      
      // Store the promise to prevent multiple initialization calls
      initializationPromiseRef.current = fetchUser().finally(() => {
        initializationPromiseRef.current = null;
      });
    }
  }, [fetchUser, initialized]);

  // Login function - sends OTP to email
  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to login' };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Verify OTP function
  const verify = async (email: string, otp: string): Promise<{ success: boolean; error?: string; redirectToOrder?: boolean }> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to verify code' };
      }
  
      // Refresh user data after successful verification
      await fetchUser(true);
      
      return { 
        success: true,
        redirectToOrder: localStorage.getItem('returnToOrderSummary') === 'true'
      };
    } catch (error) {
      console.error('Verification error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to logout');
      }
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Refresh user data function
  const refreshUser = useCallback(async (): Promise<void> => {
    await fetchUser(true);
  }, [fetchUser]);

  return {
    user,
    loading,
    initialized,
    login,
    verify,
    logout,
    refreshUser
  };
}