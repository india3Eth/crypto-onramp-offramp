"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { KycLimitCheck } from "@/components/kyc/kyc-limit-check"
import { AuthSkeleton } from "@/components/ui/auth-skeleton"
import { LimitCheckLoader } from "@/components/ui/limit-check-loader"
import { useAuth } from "@/hooks/auth/use-auth"
import { checkKycLimits } from "@/app/actions/kyc/kyc-limits"
import type { KycLimitCheckResult } from "@/types/kyc"

export default function KycLimitCheckPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [limitCheckResult, setLimitCheckResult] = useState<KycLimitCheckResult | null>(null)

  useEffect(() => {
    // If not logged in, redirect to login
    if (!loading && !user) {
      localStorage.setItem('returnToOrderSummary', 'true')
      router.push('/login?redirect=/kyc-limit-check')
      return
    }

    // If no customer ID, redirect to create customer page
    if (!loading && user && !user.customerId) {
      router.push('/customer/create?redirect=/kyc-limit-check')
      return
    }

    // Check if we have a quote in localStorage
    const savedQuote = localStorage.getItem('currentQuote')
    if (!savedQuote) {
      // If no quote, redirect to exchange
      router.push('/')
      return
    }

    const checkLimits = async () => {
      try {
        setIsChecking(true)
        const quoteData = JSON.parse(savedQuote)
        
        // Call the server action to check KYC limits
        const result = await checkKycLimits(quoteData)
        
        if (result.success) {
          setLimitCheckResult(result)
          
          // If the transaction is within limits, skip this screen and proceed to wallet address
          if (!result.limitExceeded) {
            router.push('/wallet-address')
          }
        } else {
          setError(result.message)
        }
      } catch (error) {
        console.error("Error checking KYC limits:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setIsChecking(false)
      }
    }

    if (!loading && user) {
      checkLimits()
    }
  }, [user, loading, router])

  // Handle continue with reduced amount
  const handleContinue = () => {
    router.push('/wallet-address')
  }

  // Handle updating the amount in localStorage
  const handleUpdateAmount = (newAmount: string) => {
    const savedQuote = localStorage.getItem('currentQuote')
    if (savedQuote) {
      const quoteData = JSON.parse(savedQuote)
      
      // Update the amount based on transaction mode (buy/sell)
      if (quoteData.mode === 'buy') {
        quoteData.fromAmount = newAmount
      } else {
        quoteData.toAmount = newAmount
      }
      
      localStorage.setItem('currentQuote', JSON.stringify(quoteData))
    }
  }

  // If still loading auth, show auth skeleton
  if (loading) {
    return <AuthSkeleton variant="generic" text="Checking your account..." />
  }

  // If checking limits, show engaging limit check animation
  if (isChecking) {
    return <LimitCheckLoader text="Checking your transaction limits..." />
  }

  // If error occurred, show error message
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border-2 border-red-300 text-red-800">
        <h2 className="text-xl font-bold mb-2">Error Checking Limits</h2>
        <p>{error}</p>
        <button 
          onClick={() => router.back()} 
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-800 font-medium"
        >
          Go Back
        </button>
      </div>
    )
  }

  // If no limit check result or limits are not exceeded, show transition state during redirect
  // (redirect is handled in the main useEffect above)
  if (!limitCheckResult || !limitCheckResult.limitExceeded) {
    return <AuthSkeleton variant="generic" text="Redirecting to next step..." />
  }

  // If we get here, show the KYC limit check component with smooth transition
  return (
    <div className="fade-in">
      <KycLimitCheck
        currentAmount={limitCheckResult.currentAmount ?? 0}
        maxAllowedAmount={limitCheckResult.maxAllowedAmount ?? 0}
        currency={limitCheckResult.currency ?? ""}
        baseCurrency={limitCheckResult.baseCurrency ?? ""}
        exchangeRate={limitCheckResult.exchangeRate ?? 0}
        currentLevel={limitCheckResult.currentLevel ?? ""}
        nextLevel={limitCheckResult.nextLevel ?? ""}
        period={limitCheckResult.period ?? ""}
        remainingTransactions={limitCheckResult.remainingTransactions ?? 0}
        onContinue={handleContinue}
        onUpdateAmount={handleUpdateAmount}
      />
    </div>
  )
}