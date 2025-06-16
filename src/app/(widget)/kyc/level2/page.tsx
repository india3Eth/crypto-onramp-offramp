"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/use-auth"
import { KycWidgetIframe } from "@/components/kyc/kyc-widget-iframe"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { useEffect } from "react"

export default function KycLevel2Page() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  // Redirect if not logged in or doesn't have a customerId
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/kyc/level2')
      } else if (!user.customerId) {
        router.push('/customer/create?redirect=/kyc/level2')
      }
    }
  }, [user, loading, router])

  // Redirect if already completed Level 2
  useEffect(() => {
    if (user?.kycData?.kycLevel === "Level 2" || user?.kycData?.kycLevel === "Level 3") {
      router.push('/profile')
    }
  }, [user, router])
  
  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner text="Loading..." />
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
          <h1 className="text-2xl font-bold text-center">Sign in to continue</h1>
          <p className="text-center text-gray-600">
            You need to be logged in to complete KYC verification.
          </p>
          <Button 
            onClick={() => router.push('/login?redirect=/kyc/level2')}
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            Sign in to continue
          </Button>
        </div>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <KycWidgetIframe 
        kycLevel={2}
        onComplete={() => {
          // Refresh the user data and redirect to profile
          window.location.href = '/profile'
        }}
      />
    </div>
  )
}