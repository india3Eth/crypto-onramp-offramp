"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, User, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/auth/use-auth"
import { useProfileKyc } from "@/hooks/profile/use-profile-kyc"
import { CreateCustomerForm } from "@/components/customer/create-customer-form" 
import { KycStatus } from "@/components/user/kyc-status"
import { CompactUserInfo } from "@/components/profile/compact-user-info"
import { LimitsTabView } from "@/components/profile/limits-tab-view"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, logout, refreshUser } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  // Use the profile KYC hook for automatic and manual KYC refresh
  const {
    hasInitialized: kycInitialized,
    kycLimits
  } = useProfileKyc({
    user,
    refreshUser,
    enabled: true // Always enabled for profile page
  })

  // Combined loading state for initial page load
  const isPageLoading = loading || (user && user.customerId && !kycInitialized)


  // Show loading spinner during initial page load
  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner text={
          loading 
            ? "Loading profile..." 
            : !kycInitialized 
              ? "Updating verification status..." 
              : "Loading..."
        } />
      </div>
    )
  }

  // If not logged in, show login prompt
  if (!user) {
    return (
      <Card className={`${CARD_BRUTALIST_STYLE} p-6`}>
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
    } catch {
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
      {/* Compact Personal Information - Always show */}
      <CompactUserInfo user={user} />

      {/* Transaction Limits - Only show if KYC completed */}
      {user.kycStatus === 'COMPLETED' && (
        <LimitsTabView 
          kycLimits={kycLimits}
          level={user.kycData?.kycLevel}
        />
      )}

      {/* KYC Actions - Show when KYC not completed */}
      {user.kycStatus !== 'COMPLETED' && (
        <Card className={`${CARD_BRUTALIST_STYLE} p-6`}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center border-2 border-black">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-center">Identity Verification</h2>
            
            {/* KYC Status Display using the existing component */}
            <div className="w-full">
              <KycStatus 
                status={user.kycStatus} 
                level={user.kycData?.kycLevel}
                onRefresh={refreshUser}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Standalone Logout Button */}
      <Card className={`${CARD_BRUTALIST_STYLE} p-4`}>
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