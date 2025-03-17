"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, CheckCircle, ArrowRight, Clock } from "lucide-react"

export default function OrderSummaryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Load order data from localStorage
  useEffect(() => {
    const savedQuote = localStorage.getItem('currentQuote')
    if (savedQuote) {
      setOrder(JSON.parse(savedQuote))
    } else {
      // If no order data, redirect to exchange
      router.push('/')
    }
  }, [router])

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      // Save current path to localStorage so we can return after login
      localStorage.setItem('returnToOrderSummary', 'true')
      router.push('/login?redirect=/order/summary')
    }
  }, [user, loading, router])

  // Check if user has completed necessary KYC
  useEffect(() => {
    // Only run this check if user is loaded and we have the KYC status
    if (!loading && user) {
      // If user hasn't completed any KYC
      if (!user.kycStatus || user.kycStatus === 'NONE') {
        router.push('/kyc?redirect=/order/summary');
      }
      // If user has KYC in progress or needs an update
      else if (user.kycStatus === 'PENDING' || user.kycStatus === 'IN_REVIEW' || 
               user.kycStatus === 'UPDATE_REQUIRED' || user.kycStatus === 'FAILED') {
        router.push('/profile?message=kyc_required');
      }
    }
  }, [user, loading, router]);

  // Handle order submission
  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Clear quote from localStorage
      localStorage.removeItem('currentQuote')
      
      // Show success and redirect to success page
      router.push('/order/success')
      setIsSubmitting(false)
    }, 1500)
  }
  
  if (loading || !order) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner text="Loading order details..." />
      </div>
    )
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
      
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold">Type:</span>
              <span className={order.mode === "buy" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {order.mode === "buy" ? "Buy" : "Sell"}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold">{order.mode === "buy" ? "You Pay:" : "You Send:"}</span>
              <span className="font-bold">{order.fromAmount} {order.fromCurrency}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold">{order.mode === "buy" ? "You Receive:" : "You Get:"}</span>
              <span className="font-bold">{order.toAmount} {order.toCurrency}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold">Rate:</span>
              <span>1 {order.fromCurrency} = {order.rate} {order.toCurrency}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold">Payment Method:</span>
              <span>{order.paymentMethodType.replace(/_/g, ' ')}</span>
            </div>
            
            {order.chain && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-bold">Network/Chain:</span>
                <span>{order.chain}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold">Fee:</span>
              <span>Included</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-bold">Expires:</span>
              <div className="flex items-center text-orange-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>5 minutes</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="pt-4">
            <Button
              className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              disabled={isSubmitting}
              onClick={handleSubmitOrder}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size={18} text="" className="mr-2" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  Confirm Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}