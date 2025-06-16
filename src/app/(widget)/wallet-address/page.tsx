"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/auth/use-auth"
import { ArrowLeft } from "lucide-react"
import { WalletAddressForm } from "@/components/wallet/wallet-address-form"

export default function WalletAddressPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  // Check if we have a quote in localStorage
  useEffect(() => {
    const savedQuote = localStorage.getItem('currentQuote')
    if (!savedQuote) {
      // If no quote, redirect to exchange
      router.push('/')
    }
  }, [router])
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      // Save current path to localStorage so we can return after login
      localStorage.setItem('returnToOrderSummary', 'true')
      router.push('/login?redirect=/wallet-address')
    }
  }, [user, loading, router])
  
  // Check if user has completed necessary KYC
  useEffect(() => {
    // Only run this check if user is loaded and we have the KYC status
    if (!loading && user) {
      // If user hasn't completed any KYC
      if (!user.kycStatus || user.kycStatus === 'NONE') {
        router.push('/kyc?redirect=/wallet-address');
      }
      // If user has KYC in progress or needs an update
      else if (user.kycStatus === 'PENDING' || user.kycStatus === 'IN_REVIEW' || 
               user.kycStatus === 'UPDATE_REQUIRED' || user.kycStatus === 'FAILED') {
        router.push('/profile?message=kyc_required');
      }
    }
  }, [user, loading, router]);
  
  // Handle form submission
  const handleSubmit = (walletAddress: string, isValid: boolean) => {
    if (isValid) {
      // Save wallet address to localStorage
      const savedQuote = localStorage.getItem('currentQuote')
      if (savedQuote) {
        const quoteData = JSON.parse(savedQuote)
        quoteData.depositAddress = walletAddress
        localStorage.setItem('currentQuote', JSON.stringify(quoteData))
        
        // Redirect to order summary
        router.push('/order/summary')
      }
    }
  }
  
  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner text="Loading..." />
      </div>
    )
  }
  
  // If not logged in, we will be redirected by the useEffect
  if (!user) {
    return null
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      
      <WalletAddressForm onSubmit={handleSubmit} />
    </div>
  )
}