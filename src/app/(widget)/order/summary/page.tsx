"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, CheckCircle, ArrowRight, Clock, Copy, AlertCircle, RefreshCw } from "lucide-react"
import { FeeDisplay } from "@/components/exchange/fee-display"
import { createOnrampOrder, createOfframpOrder } from "@/app/actions/order"
import { createQuote } from "@/app/actions/quote"
import { CheckoutIframe } from "@/components/order/checkout-iframe"

export default function OrderSummaryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false)
  const [quoteExpiryTime, setQuoteExpiryTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  
  // Check for cancel parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cancel')) {
      console.log("Cancel parameter detected in URL, redirecting to cancel page");
      router.replace('/order/cancel');
      return;
    }
  }, [router]);
  
  // Load order data from localStorage
  useEffect(() => {
    const savedQuote = localStorage.getItem('currentQuote')
    if (savedQuote) {
      const parsedQuote = JSON.parse(savedQuote)
      setOrder(parsedQuote)
      
      // Set expiry time if available
      if (parsedQuote.lastUpdated) {
        // Quote expires in 10 seconds from when it was created
        const expiryTime = parsedQuote.lastUpdated + 10000
        setQuoteExpiryTime(expiryTime)
      }
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
  
  
  useEffect(() => {
    const savedQuote = localStorage.getItem('currentQuote')
    if (savedQuote) {
      const quoteData = JSON.parse(savedQuote)
      setOrder(quoteData)
      
      // If no deposit address is set in the order, redirect to wallet address page
      if (!quoteData.depositAddress && !isSubmitting && !checkoutUrl) {
        router.push('/wallet-address')
      }
    } else {
      // If no order data, redirect to exchange
      router.push('/')
    }
  }, [router, isSubmitting, checkoutUrl])

  // Countdown timer for quote expiry
  useEffect(() => {
    if (!quoteExpiryTime) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, quoteExpiryTime - now)
      
      setTimeRemaining(Math.ceil(remaining / 1000))
      
      // Auto refresh when time is up
      if (remaining <= 0 && !isRefreshingQuote) {
        refreshQuote()
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [quoteExpiryTime, isRefreshingQuote])

  // Function to refresh the quote
  const refreshQuote = useCallback(async () => {
    if (!order || isRefreshingQuote) return
    
    try {
      setIsRefreshingQuote(true)
      setError(null)
      
      // Create a new quote request based on the current order
      const quoteRequest = {
        fromAmount: order.mode === "buy" ? order.fromAmount : "",
        toAmount: order.mode === "buy" ? "" : order.toAmount,
        fromCurrency: order.fromCurrency,
        toCurrency: order.toCurrency,
        paymentMethodType: order.paymentMethodType,
        chain: order.chain || ""
      }
      
      const newQuote = await createQuote(quoteRequest)
      
      // Update the order with the new quote data
      const updatedOrder = {
        ...order,
        quoteId: newQuote.quoteId,
        fromAmount: newQuote.fromAmount,
        toAmount: newQuote.toAmount,
        rate: parseFloat(newQuote.rate).toFixed(6),
        fees: newQuote.fees || [],
        lastUpdated: Date.now()
      }
      
      // Update state and localStorage
      setOrder(updatedOrder)
      localStorage.setItem('currentQuote', JSON.stringify(updatedOrder))
      
      // Set new expiry time (10 seconds from now)
      const newExpiryTime = Date.now() + 10000
      setQuoteExpiryTime(newExpiryTime)
      
    } catch (error) {
      console.error("Error refreshing quote:", error)
      setError(error instanceof Error ? error.message : "Failed to refresh quote")
    } finally {
      setIsRefreshingQuote(false)
    }
  }, [order, isRefreshingQuote])

  // Handle order submission
  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      if (!order) {
        throw new Error("Order data not found")
      }
      
      // First refresh the quote to ensure we have a fresh quote ID
      await refreshQuote()
      
      // Get the latest order data with fresh quote
      const currentOrderData = JSON.parse(localStorage.getItem('currentQuote') || '{}')
      
      if (!currentOrderData.quoteId) {
        throw new Error("Could not get a fresh quote ID")
      }
      
      // Determine which API to call based on mode (buy/sell)
      let result
      if (currentOrderData.mode === "buy") {
        result = await createOnrampOrder(currentOrderData, currentOrderData.depositAddress)
      } else {
        result = await createOfframpOrder(currentOrderData, currentOrderData.depositAddress)
      }
      
      if (!result.success) {
        throw new Error(result.message || "Failed to create order")
      }
      
      // Store the checkout URL and transaction ID
      if (result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl)
        
        // Store transaction information with timestamp to track expiration
        localStorage.setItem('checkoutSession', JSON.stringify({
          checkoutUrl: result.checkoutUrl,
          transactionId: result.transactionId,
          timestamp: Date.now(),
          orderId: currentOrderData.quoteId
        }))
      }
      
      if (result.transactionId) {
        setTransactionId(result.transactionId)
        
        // Store transaction ID in the current order
        const updatedOrder = {
          ...currentOrderData,
          transactionId: result.transactionId
        }
        localStorage.setItem('currentQuote', JSON.stringify(updatedOrder))
      }
      
      // If this is an offramp (sell) order, or no checkout URL is provided,
      // redirect to success page directly
      if (currentOrderData.mode === "sell" || !result.checkoutUrl) {
        router.push('/order/success')
      }
      
    } catch (error) {
      console.error("Error submitting order:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle completion of checkout
  const handleCheckoutComplete = () => {
    console.log("Checkout complete, redirecting to success page")
    
    // Clear quotes and checkout session from localStorage
    localStorage.removeItem('currentQuote')
    localStorage.removeItem('checkoutSession')
    
    // Show success and redirect to success page using the router
    // We use replace instead of push to prevent going back to the checkout
    router.replace('/order/success')
  }
  
  // Handle back from checkout
  const handleBackFromCheckout = () => {
    console.log("User went back from checkout or checkout was cancelled")
    // Remove the checkout session from localStorage
    localStorage.removeItem('checkoutSession')
    // Clear the checkout URL to go back to the order summary
    setCheckoutUrl(null)
  }
  
  // If loading or no order data, show loading spinner
  if (loading || !order) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner text="Loading order details..." />
      </div>
    )
  }

  // If we have a checkout URL, show the iframe
  if (checkoutUrl) {
    return (
      <CheckoutIframe
        checkoutUrl={checkoutUrl}
        onBack={handleBackFromCheckout}
        onComplete={handleCheckoutComplete}
      />
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
            {order.depositAddress && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-bold">Wallet Address:</span>
                <div className="flex items-center">
                  <span className="text-sm max-w-[180px] truncate">{order.depositAddress}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={() => {
                      navigator.clipboard.writeText(order.depositAddress);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="font-bold">Fees:</span>
              {order.quote && order.quote.fees && order.quote.fees.length > 0 ? (
                <FeeDisplay fees={order.quote.fees} mode={order.mode} />
              ) : (
                <span>Included</span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-bold">Quote Expires:</span>
              <div className={`flex items-center ${timeRemaining && timeRemaining < 3 ? "text-red-600" : "text-orange-600"}`}>
                <Clock className="h-4 w-4 mr-1" />
                <span>{timeRemaining !== null ? `${timeRemaining}s` : "Refreshing..."}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 p-1 h-6 w-6"
                  onClick={refreshQuote}
                  disabled={isRefreshingQuote}
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshingQuote ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Error display */}
          {error && (
            <div className="p-4 mt-2 bg-red-100 text-red-600 border-2 border-red-600 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="pt-4">
            <Button
              className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              disabled={isSubmitting || isRefreshingQuote || (timeRemaining !== null && timeRemaining <= 0)}
              onClick={handleSubmitOrder}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size={18} text="" className="mr-2" />
                  Processing...
                </div>
              ) : isRefreshingQuote ? (
                <div className="flex items-center">
                  <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                  Refreshing Quote...
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