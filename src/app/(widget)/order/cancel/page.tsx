"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, Home } from "lucide-react"
import { useEffect, useState } from "react"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

export default function OrderCancelPage() {
  const router = useRouter()
  const [isInIframe, setIsInIframe] = useState(false)
  
  // Detect if the page is loaded within an iframe
  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window !== window.parent
    setIsInIframe(inIframe)
    
    // If we're in an iframe, send a message to the parent window
    if (inIframe) {
      try {
        // Tell the parent window that we've reached the cancel page
        window.parent.postMessage({ status: "cancelled" }, "*")
        
        // Also attempt to send specific data from the URL if available
        const urlParams = new URLSearchParams(window.location.search)
        const orderId = urlParams.get('cancel')
        if (orderId) {
          window.parent.postMessage({
            status: "cancelled",
            orderId: orderId,
            message: "Transaction cancelled"
          }, "*")
        }
      } catch (e) {
        // Error sending message to parent - expected in some environments
      }
    }

    // Clean up any order data regardless of if we're in an iframe
    localStorage.removeItem('currentQuote')
    localStorage.removeItem('checkoutSession')
  }, [])
  
  // If we're in an iframe, show a simplified version without navigation
  if (isInIframe) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-2 border-black">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold">Transaction Cancelled</h1>
          
          <p className="text-gray-600">
            Your order has been cancelled.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <Card className={`${CARD_BRUTALIST_STYLE.replace('bg-white', 'bg-red-50')}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-2 border-black">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold">Order Cancelled</h1>
            
            <p className="text-gray-600">
              Your transaction was cancelled or could not be completed.
              You can try again or return to the home page.
            </p>
            
            <div className="w-full space-y-3 mt-4">
              <Button
                className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                onClick={() => router.push('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                onClick={() => router.push('/profile')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                View My Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}