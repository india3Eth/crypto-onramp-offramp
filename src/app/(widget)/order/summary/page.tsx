"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/auth/use-auth"
import { ArrowLeft, ArrowRight, Clock, Copy, AlertCircle, RefreshCw } from "lucide-react"
import { FeeDisplay } from "@/components/exchange/fee-display"
import { createOnrampOrder, createOfframpOrder } from "@/app/actions/exchange/order"
import { createQuote } from "@/app/actions/exchange/quote"
import { CheckoutIframe } from "@/components/order/checkout-iframe"
import { PaymentInstructions } from "@/components/order/payment-instructions"
import { CryptoDepositScreen } from "@/components/order/crypto-deposit-screen"
import { FiatAccountSelector } from "@/components/exchange/fiat-account-selector"
import { CARD_BRUTALIST_STYLE, QUOTE_EXPIRY_MS } from "@/utils/common/constants"

export default function OrderSummaryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [, setTransactionId] = useState<string | null>(null)
  const [fiatPaymentInstructions, setFiatPaymentInstructions] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false)
  const [quoteExpiryTime, setQuoteExpiryTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [selectedFiatAccountId, setSelectedFiatAccountId] = useState<string>("")
  const [showFiatAccountSelection, setShowFiatAccountSelection] = useState(false)
  const [cryptoDepositData, setCryptoDepositData] = useState<any>(null)
  
  // Check for cancel parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cancel')) {
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
        // Quote expires in configured time from when it was created
        const expiryTime = parsedQuote.lastUpdated + QUOTE_EXPIRY_MS
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
      
      // Check for existing payment instructions session
      const savedPaymentInstructions = localStorage.getItem('paymentInstructions')
      if (savedPaymentInstructions) {
        const paymentData = JSON.parse(savedPaymentInstructions)
        // Restore payment instructions if they match the current order
        if (paymentData.orderId === quoteData.quoteId) {
          setFiatPaymentInstructions(paymentData.instructions)
          setTransactionId(paymentData.transactionId)
        } else {
          // Clear stale payment instructions
          localStorage.removeItem('paymentInstructions')
        }
      }

      // Check for existing checkout session
      const savedCheckoutSession = localStorage.getItem('checkoutSession')
      if (savedCheckoutSession) {
        const checkoutData = JSON.parse(savedCheckoutSession)
        // Restore checkout URL if it matches the current order
        if (checkoutData.orderId === quoteData.quoteId) {
          setCheckoutUrl(checkoutData.checkoutUrl)
          setTransactionId(checkoutData.transactionId)
        } else {
          // Clear stale checkout session
          localStorage.removeItem('checkoutSession')
        }
      }
      
      // If no deposit address is set in the order, redirect to wallet address page
      if (!quoteData.depositAddress && !isSubmitting && !checkoutUrl && !fiatPaymentInstructions) {
        router.push('/wallet-address')
      }
    } else {
      // Only redirect to exchange if we're not currently submitting or showing payment UI
      if (!isSubmitting && !checkoutUrl && !fiatPaymentInstructions) {
        console.log('No order data found, redirecting to exchange...')
        router.push('/')
      }
    }
  }, [router])

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
      
      // Set new expiry time
      const newExpiryTime = Date.now() + QUOTE_EXPIRY_MS
      setQuoteExpiryTime(newExpiryTime)
      
    } catch (error) {
      console.error("Error refreshing quote:", error)
      setError(error instanceof Error ? error.message : "Failed to refresh quote")
    } finally {
      setIsRefreshingQuote(false)
    }
  }, [order, isRefreshingQuote])

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
  }, [quoteExpiryTime, isRefreshingQuote, refreshQuote])

  // Check if we should show fiat account selection
  const shouldShowFiatAccountSelection = () => {
    return order?.mode === "sell" && !selectedFiatAccountId && !showFiatAccountSelection
  }

  // Handle proceeding to fiat account selection
  const handleProceedToFiatAccount = () => {
    if (order?.mode === "sell") {
      setShowFiatAccountSelection(true)
    } else {
      handleSubmitOrder()
    }
  }

  // Handle order submission
  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      if (!order) {
        throw new Error("Order data not found")
      }

      // For offramp orders, check if fiat account is selected
      if (order.mode === "sell" && !selectedFiatAccountId) {
        throw new Error("Please select a fiat account to receive funds")
      }
      
      // First refresh the quote to ensure we have a fresh quote ID
      await refreshQuote()
      
      // Get the latest order data with fresh quote
      const currentOrderData = JSON.parse(localStorage.getItem('currentQuote') || '{}')
      
      if (!currentOrderData.quoteId) {
        throw new Error("Could not get a fresh quote ID")
      }

      // Add fiat account ID for offramp orders
      if (order.mode === "sell") {
        currentOrderData.fiatAccountId = selectedFiatAccountId
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

      // For offramp orders, show crypto deposit screen
      if (currentOrderData.mode === "sell" && result.transactionId) {
        const depositData = {
          transactionId: result.transactionId,
          fromAmount: currentOrderData.fromAmount,
          fromCurrency: currentOrderData.fromCurrency,
          toCurrency: currentOrderData.toCurrency,
          chain: currentOrderData.chain,
          depositAddress: result.depositAddress || "",
          expiration: result.expiration || new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes default
          memo: result.memo || ""
        }
        setCryptoDepositData(depositData)
        return
      }
      
      // Store the checkout URL and transaction ID (for onramp orders)
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

      // Store fiat payment instructions if present
      if (result.fiatPaymentInstructions) {
        setFiatPaymentInstructions(result.fiatPaymentInstructions)
        
        // Store payment instructions in localStorage
        localStorage.setItem('paymentInstructions', JSON.stringify({
          instructions: result.fiatPaymentInstructions,
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
      
      
    } catch (error) {
      console.error("Error submitting order:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle completion of checkout
  const handleCheckoutComplete = () => {
    // Clear quotes and checkout session from localStorage
    localStorage.removeItem('currentQuote')
    localStorage.removeItem('checkoutSession')
    
    // Show success and redirect to success page using the router
    // We use replace instead of push to prevent going back to the checkout
    router.replace('/order/success')
  }
  
  // Handle back from checkout
  const handleBackFromCheckout = () => {
    // Remove the checkout session from localStorage
    localStorage.removeItem('checkoutSession')
    // Clear the checkout URL to go back to the order summary
    setCheckoutUrl(null)
  }

  // Handle back from payment instructions
  const handleBackFromPaymentInstructions = () => {
    // Remove the payment instructions from localStorage
    localStorage.removeItem('paymentInstructions')
    // Clear the payment instructions to go back to the order summary
    setFiatPaymentInstructions(null)
  }

  // Handle crypto deposit screen actions
  const handleCryptoDepositCancel = () => {
    setCryptoDepositData(null)
    // Optionally redirect back to main page
    router.push('/')
  }

  const handleCryptoDepositConfirm = () => {
    // Clear crypto deposit data and redirect to success
    setCryptoDepositData(null)
    localStorage.removeItem('currentQuote')
    router.replace('/order/success')
  }

  // Handle fiat account selection
  const handleFiatAccountSelect = (accountId: string) => {
    setSelectedFiatAccountId(accountId)
  }

  const handleFiatAccountBack = () => {
    setShowFiatAccountSelection(false)
  }

  // If loading or no order data, show loading spinner
  if (loading || !order) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner text="Loading order details..." />
      </div>
    )
  }

  // If we have crypto deposit data (offramp), show crypto deposit screen
  if (cryptoDepositData) {
    return (
      <CryptoDepositScreen
        orderData={cryptoDepositData}
        onCancel={handleCryptoDepositCancel}
        onConfirmSent={handleCryptoDepositConfirm}
      />
    )
  }

  // If showing fiat account selection for offramp
  if (showFiatAccountSelection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={handleFiatAccountBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <FiatAccountSelector
          selectedAccountId={selectedFiatAccountId}
          onAccountSelect={handleFiatAccountSelect}
        />

        {selectedFiatAccountId && (
          <Button
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
            onClick={() => setShowFiatAccountSelection(false)}
          >
            Continue with Selected Account
          </Button>
        )}
      </div>
    )
  }

  // If we have fiat payment instructions, show payment instructions
  if (fiatPaymentInstructions) {
    return (
      <PaymentInstructions
        paymentInstructions={fiatPaymentInstructions}
        orderData={order}
        onBack={handleBackFromPaymentInstructions}
      />
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
      
      <Card className={CARD_BRUTALIST_STYLE}>
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
              onClick={shouldShowFiatAccountSelection() ? handleProceedToFiatAccount : handleSubmitOrder}
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
              ) : shouldShowFiatAccountSelection() ? (
                <div className="flex items-center">
                  Select Fiat Account
                  <ArrowRight className="ml-2 h-4 w-4" />
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