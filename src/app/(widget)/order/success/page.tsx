"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Home, ExternalLink, Copy } from "lucide-react"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"
import { useTransactionDetails, getExplorerUrl, formatCryptoAmount, formatFiatAmount } from "@/hooks/exchange/use-transaction-details"

export default function OrderSuccessPage() {
  const router = useRouter()
  const [isInIframe, setIsInIframe] = useState(false)
  const [referenceId, setReferenceId] = useState<string | null>(null)
  const [isPaymentSent, setIsPaymentSent] = useState(false)
  
  // Get transaction details if we have a reference ID
  const { transaction, isLoading: isLoadingTransaction } = useTransactionDetails(referenceId || undefined)
  
  // Detect if the page is loaded within an iframe
  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window !== window.parent
    setIsInIframe(inIframe)
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const orderType = urlParams.get('type')
    console.log("Order type:", orderType)
    const orderMd = urlParams.get('OrderMd')
    const refId = urlParams.get('referenceId') || orderMd
    
    // Set payment sent flag if this is a payment instruction success
    if (orderType === 'payment-sent') {
      setIsPaymentSent(true)
    }
    
    if (refId) {
      setReferenceId(refId)
    }
    
    // If we're in an iframe, send a message to the parent window
    if (inIframe) {
      try {
        // Tell the parent window that we've reached the success page
        window.parent.postMessage({ status: "success" }, "*")
        
        // Also attempt to send specific data from the URL if available
        if (orderMd) {
          window.parent.postMessage({ 
            status: "success", 
            orderId: orderMd,
            referenceId: refId,
            message: "Transaction complete"
          }, "*")
        }
      } catch (e) {
        // Error sending message to parent - expected in some environments
      }
    }
    
    // If we reached this page directly, clean up any leftover order data
    // For payment-sent orders, always clear localStorage
    // For regular orders, only clear if not in iframe
    if (!inIframe || orderType === 'payment-sent') {
      localStorage.removeItem('currentQuote')
      localStorage.removeItem('checkoutSession')
      localStorage.removeItem('paymentInstructions')
    }
  }, [])
  
  // If we're in an iframe, show a simplified version without navigation
  if (isInIframe) {
    return (
      <div className="p-6 bg-green-50 rounded-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-black">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold">Transaction Complete!</h1>
          
          <p className="text-gray-600">
            Your order has been successfully processed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className={`${CARD_BRUTALIST_STYLE.replace('bg-white', 'bg-green-50')}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-black">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold">
              {isPaymentSent ? "Order Successfully Placed!" : "Order Complete!"}
            </h1>
            
            <p className="text-gray-600">
              {isPaymentSent ? (
                "Thank you for confirming your bank transfer. We will process your crypto purchase once we receive your payment. You will receive a confirmation email shortly."
              ) : (
                <>
                  Your transaction has been successfully processed.
                  {!transaction && " You will receive a confirmation email shortly."}
                </>
              )}
            </p>
            
            {/* Transaction Details */}
            {transaction && (
              <div className="w-full mt-6 p-4 bg-white rounded-lg border-2 border-gray-300">
                <h2 className="text-lg font-bold mb-3 text-left">Transaction Details</h2>
                <div className="space-y-2 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Purchased:</span>
                    <span className="font-medium">
                      {formatCryptoAmount(transaction.cryptoAmount, transaction.cryptoCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">
                      {formatFiatAmount(transaction.fiatAmount, transaction.fiatCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span className="font-medium">{transaction.networkId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{transaction.paymentMethod}</span>
                  </div>
                  {transaction.txHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction Hash:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-xs">
                          {transaction.txHash.slice(0, 6)}...{transaction.txHash.slice(-4)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => navigator.clipboard.writeText(transaction.txHash!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(getExplorerUrl(transaction.txHash!, transaction.networkId), '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600 capitalize">
                      {transaction.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            
          </div>
        </CardContent>
      </Card>
    </div>
  )
}