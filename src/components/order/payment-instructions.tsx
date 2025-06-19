"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Clock, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"
interface FiatPaymentInstructions {
  beneficiaryName: string;
  expirationDate: string;
  iban: string;
  paymentType: string;
  reference: string;
}

interface PaymentInstructionsProps {
  paymentInstructions: FiatPaymentInstructions
  orderData: any
  onBack?: () => void
}

export function PaymentInstructions({ 
  paymentInstructions, 
  orderData, 
  onBack
}: PaymentInstructionsProps) {
  const router = useRouter()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  // Calculate time remaining until expiration
  useEffect(() => {
    if (!paymentInstructions.expirationDate) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(paymentInstructions.expirationDate).getTime()
      const remaining = Math.max(0, expiry - now)
      
      setTimeRemaining(Math.ceil(remaining / 1000))
      
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [paymentInstructions.expirationDate])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const handleConfirmPayment = () => {
    setIsConfirming(true)
    
    console.log('Payment confirmation clicked, navigating to success page...')
    // Redirect to success page first, then clear localStorage in the success page
    router.push('/order/success?type=payment-sent')
  }

  const isExpired = timeRemaining !== null && timeRemaining <= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <Card className={CARD_BRUTALIST_STYLE}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Bank Transfer Details</CardTitle>
          <p className="text-center text-gray-600">
            Transfer {orderData.fromAmount} {orderData.fromCurrency} to complete your order
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-3 p-4 bg-gray-50 border-2 border-black rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-bold">You Pay:</span>
              <span className="font-bold text-lg">{orderData.fromAmount} {orderData.fromCurrency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">You Receive:</span>
              <span className="font-bold text-lg">{orderData.toAmount} {orderData.toCurrency}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b-2 border-black pb-2">
              Payment Details
            </h3>

            {/* Beneficiary Name */}
            <div className="space-y-2">
              <label className="font-bold text-sm">Beneficiary Name:</label>
              <div className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-md">
                <span className="flex-1 font-mono">{paymentInstructions.beneficiaryName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(paymentInstructions.beneficiaryName, 'beneficiary')}
                >
                  {copiedField === 'beneficiary' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* IBAN */}
            <div className="space-y-2">
              <label className="font-bold text-sm">IBAN:</label>
              <div className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-md">
                <span className="flex-1 font-mono text-lg">{paymentInstructions.iban}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(paymentInstructions.iban, 'iban')}
                >
                  {copiedField === 'iban' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <label className="font-bold text-sm">Reference Number (IMPORTANT):</label>
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border-2 border-yellow-500 rounded-md">
                <span className="flex-1 font-mono text-lg font-bold">{paymentInstructions.reference}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(paymentInstructions.reference, 'reference')}
                >
                  {copiedField === 'reference' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-yellow-700 font-medium">
                ⚠️ You MUST include this reference number in your transfer
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="font-bold text-sm">Transfer Amount:</label>
              <div className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-md">
                <span className="flex-1 font-mono text-lg font-bold">
                  {orderData.fromAmount} {orderData.fromCurrency}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(`${orderData.fromAmount}`, 'amount')}
                >
                  {copiedField === 'amount' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <label className="font-bold text-sm">Payment Type:</label>
              <div className="p-3 bg-white border-2 border-black rounded-md">
                <span className="font-mono">{paymentInstructions.paymentType}</span>
              </div>
            </div>
          </div>

          {/* Expiration Warning */}
          {timeRemaining !== null && (
            <div className={`p-4 border-2 rounded-md flex items-center gap-3 ${
              isExpired 
                ? 'bg-red-100 border-red-500 text-red-700'
                : timeRemaining < 3600 
                  ? 'bg-orange-100 border-orange-500 text-orange-700'
                  : 'bg-blue-100 border-blue-500 text-blue-700'
            }`}>
              {isExpired ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <Clock className="h-5 w-5 flex-shrink-0" />
              )}
              <div>
                <p className="font-bold">
                  {isExpired ? 'Payment Expired' : 'Time Remaining'}
                </p>
                <p className="text-sm">
                  {isExpired 
                    ? 'This payment link has expired. Please create a new order.'
                    : `Complete your transfer within ${formatTimeRemaining(timeRemaining)}`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Important Instructions */}
          <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-md">
            <h4 className="font-bold text-blue-900 mb-2">Important Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Make the transfer from a bank account in your name</li>
              <li>• Include the reference number exactly as shown</li>
              <li>• Transfer the exact amount specified</li>
              <li>• Your crypto will be sent once we receive your payment</li>
            </ul>
          </div>

          {/* Confirm Payment Button */}
          <div className="pt-4">
            <Button
              className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              onClick={handleConfirmPayment}
              disabled={isConfirming || isExpired}
            >
              {isConfirming ? (
                <div className="flex items-center">
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  I have sent the payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </Button>
            <p className="text-center text-sm text-gray-600 mt-2">
              Click this button after completing your bank transfer
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}