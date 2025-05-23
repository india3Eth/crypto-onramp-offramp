"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, User, AlertCircle, Clock, RefreshCw } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/use-auth"
import { CreateCustomerForm } from "@/components/customer/create-customer-form" 
import { refreshKycStatus } from "@/app/actions/kyc-status"
import { KycStatus } from "@/components/user/kyc-status"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, logout, refreshUser } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [isRefreshingKyc, setIsRefreshingKyc] = useState(false)
  const [kycRefreshError, setKycRefreshError] = useState<string | null>(null)
  

  // On component mount Refresh the kyc status

  useEffect(() => {
    if (user) {
      refreshKycStatus()
    }
  }, [user])

  // Handle KYC status refresh
  const handleRefreshKycStatus = async () => {
    try {
      setIsRefreshingKyc(true)
      setKycRefreshError(null)
      
      const result = await refreshKycStatus()
      
      if (result.success) {
        // Refresh user data to get updated KYC status
        await refreshUser()
      } else {
        setKycRefreshError(result.message)
      }
    } catch (error) {
      console.error("Error refreshing KYC status:", error)
      setKycRefreshError(error instanceof Error ? error.message : "Failed to refresh KYC status")
    } finally {
      setIsRefreshingKyc(false)
    }
  }

  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner text="Loading profile..." />
      </div>
    )
  }

  // If not logged in, show login prompt
  if (!user) {
    return (
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center border-2 border-black">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Sign in to access your profile</h1>
          <p className="text-center text-gray-600">
            You need to be logged in to view and manage your profile details.
          </p>
          <Button 
            onClick={() => router.push('/login')}
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            Sign in
          </Button>
        </div>
      </Card>
    )
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setLogoutError(null)
      await logout()
    } catch (error) {
      setLogoutError("Failed to log out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  // Check if the user has a customerId - if not, show the create customer form
  if (!user.customerId) {
    return (
      <div className="space-y-6">
        <CreateCustomerForm />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center border-2 border-black mb-4">
            <User className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold">Your Profile</h1>
        </div>

        {/* Basic user info */}
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
            <p className="font-bold mb-1 text-gray-600">Email Address</p>
            <p className="font-medium">{user.email}</p>
          </div>
          
          {user.isVerified ? (
            <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300 flex items-start">
              <div className="bg-white p-1 rounded-full mr-2">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold">Email Verified</p>
                <p className="text-sm text-green-700">Your email has been verified</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300 flex items-start">
              <div className="bg-white p-1 rounded-full mr-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-bold">Email Not Verified</p>
                <p className="text-sm text-yellow-700">Please verify your email</p>
              </div>
            </div>
          )}
        </div>

        {/* KYC status */}
        <div className="space-y-4 mb-8">
          {/* KYC status component */}
          <KycStatus 
            status={user.kycStatus} 
            level={user.kycData?.kycLevel}
            onRefresh={refreshUser}
          />

          {/* KYC pending status with refresh button */}
          {user.kycStatus === 'PENDING' && (
            <div className="p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="bg-white p-1 rounded-full mr-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-bold">KYC Verification Pending</p>
                    <p className="text-sm text-yellow-700">Your identity verification is being processed. We'll update you when it's complete.</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshKycStatus}
                  disabled={isRefreshingKyc}
                  className="ml-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  {isRefreshingKyc ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Show error message if refresh failed */}
              {kycRefreshError && (
                <div className="mt-2 p-2 bg-red-100 text-red-600 border border-red-300 rounded-md text-sm">
                  {kycRefreshError}
                </div>
              )}
            </div>
          )}
          
          {/* KYC failed status */}
          {(user.kycStatus === 'UPDATE_REQUIRED' || user.kycStatus === 'FAILED') && (
            <div className="p-4 bg-red-100 rounded-lg border-2 border-red-300">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="bg-white p-1 rounded-full mr-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold">KYC Verification Failed</p>
                    <p className="text-sm text-red-700">
                      {user.kycData?.statusReason || "We couldn't verify your identity. Please try again."}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshKycStatus}
                  disabled={isRefreshingKyc}
                  className="ml-2 border-red-600 text-red-600 hover:bg-red-50"
                >
                  {isRefreshingKyc ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Show retry buttons based on last attempted level */}
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={() => router.push('/kyc')}
                  className="w-full bg-red-500 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                >
                  <User className="mr-2 h-5 w-5" />
                  Retry Level 1 Verification
                </Button>
              </div>
            </div>
          )}
          
          {/* Button to start KYC if not started */}
          {(!user.kycStatus || user.kycStatus === 'NONE') && (
            <Button 
              onClick={() => router.push('/kyc')}
              className="w-full bg-blue-500 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
            >
              <User className="mr-2 h-5 w-5" />
              Complete KYC Level 1 Verification
            </Button>
          )}
        </div>
        
        {/* Logout button */}
        <Button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-red-500 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
        >
          {isLoggingOut ? (
            <>
              <LoadingSpinner size={18} text="" className="mr-2" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-5 w-5" />
              Log out
            </>
          )}
        </Button>
        
        {/* Logout error message */}
        {logoutError && (
          <div className="mt-4 p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{logoutError}</p>
          </div>
        )}
      </Card>
    </div>
  )
}