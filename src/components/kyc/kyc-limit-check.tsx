"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowUpRight, ArrowLeft } from "lucide-react"
import type { KycLevelLimit } from "@/types/exchange"

interface KycLimitCheckProps {
  currentAmount: number
  maxAllowedAmount: number
  currency: string
  baseCurrency: string
  exchangeRate: number
  currentLevel: string
  nextLevel: string
  period: string
  remainingTransactions: number
  onContinue: () => void
  onUpdateAmount: (newAmount: string) => void
}

export function KycLimitCheck({
  currentAmount,
  maxAllowedAmount,
  currency,
  baseCurrency,
  exchangeRate,
  currentLevel,
  nextLevel,
  period,
  remainingTransactions,
  onContinue,
  onUpdateAmount
}: KycLimitCheckProps) {
  const router = useRouter()
  const [useReducedAmount, setUseReducedAmount] = useState(false)
  
  // Calculate equivalent values
  const currentAmountBase = (currentAmount * exchangeRate).toFixed(2)
  const maxAllowedAmountBase = (maxAllowedAmount * exchangeRate).toFixed(2)
  
  // Format the period for display
  const formattedPeriod = period.charAt(0).toUpperCase() + period.slice(1)
  
  // Check if maxAllowedAmount is less than 15 EUR equivalent
  const maxAllowedAmountEUR = maxAllowedAmount * exchangeRate
  const isBelowMinimumThreshold = maxAllowedAmountEUR < 15
  
  const handleReduceAmount = () => {
    // Update the transaction amount to the maximum allowed
    onUpdateAmount(maxAllowedAmount.toString())
    setUseReducedAmount(true)
  }
  
  const handleContinueWithReduced = () => {
    onContinue()
  }
  
  const handleBackToExchange = () => {
    router.back()
  }

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-400 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          
          <h2 className="text-xl font-bold text-center mb-2">Transaction Limit Exceeded</h2>
          
          <div className="p-4 bg-red-50 border-2 border-red-100 rounded-lg w-full mb-4">
            <p className="text-center text-red-700">
              Your transaction of <span className="font-bold">{currentAmount} {currency}</span> 
              {baseCurrency !== currency && ` (≈${currentAmountBase} ${baseCurrency})`} 
              exceeds your {formattedPeriod} limit of <span className="font-bold">{maxAllowedAmount.toFixed(2)} {currency}</span> 
              {baseCurrency !== currency && ` (≈${maxAllowedAmountBase} ${baseCurrency})`}.
            </p>
          </div>
          
          {!isBelowMinimumThreshold && (
            <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-lg w-full mb-6">
              <p className="font-medium text-blue-700 mb-2">You have two options:</p>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li><span className="font-medium">Reduce your transaction amount</span> to stay within your current limits</li>
                <li><span className="font-medium">Upgrade your KYC level</span> to increase your transaction limits</li>
              </ol>
            </div>
          )}
          
          <div className="bg-yellow-50 p-4 border-2 border-yellow-100 rounded-lg w-full mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-bold">Current KYC Level:</span> {currentLevel}
              <br/>
              <span className="font-bold">Remaining transactions:</span> {remainingTransactions} for this {period}
              <br/>
              <span className="font-bold">Available limit:</span> {maxAllowedAmount.toFixed(2)} {currency} 
              {baseCurrency !== currency && ` (≈${maxAllowedAmountBase} ${baseCurrency})`}
            </p>
          </div>
          
          <div className="space-y-3 w-full">
            {/* Only show the reduced amount button if above minimum threshold */}
            {!isBelowMinimumThreshold && !useReducedAmount && (
              <Button
                onClick={handleReduceAmount}
                className="w-full bg-green-500 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              >
                Continue with ({maxAllowedAmount.toFixed(2)} {currency})
              </Button>
            )}
            
            {!isBelowMinimumThreshold && useReducedAmount && (
              <Button
                onClick={handleContinueWithReduced}
                className="w-full bg-green-500 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              >
                Proceed with Reduced Amount
              </Button>
            )}
            
            <Button
              onClick={() => router.push('/kyc/level2')}
              className="w-full bg-blue-500 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
            >
              {isBelowMinimumThreshold ? 
                `Upgrade to ${nextLevel} to Continue` : 
                `Upgrade to ${nextLevel}`}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleBackToExchange}
              variant="outline"
              className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exchange
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}