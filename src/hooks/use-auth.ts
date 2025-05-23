import { useState, useEffect } from 'react';
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
  const router = useRouter();

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchUser();
  }, [redirectIfFound, redirectTo, router]);

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
      const userRes = await fetch('/api/auth/user');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        
        return { 
          success: true,
          redirectToOrder: localStorage.getItem('returnToOrderSummary') === 'true'
        };
      }
  
      return { success: true };
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

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/user');
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    verify,
    logout,
    refreshUser
  };
}