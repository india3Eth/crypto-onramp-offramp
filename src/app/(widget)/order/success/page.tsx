"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Home } from "lucide-react"

export default function OrderSuccessPage() {
  const router = useRouter()
  const [isInIframe, setIsInIframe] = useState(false)
  
  // Detect if the page is loaded within an iframe
  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window !== window.parent
    setIsInIframe(inIframe)
    
    // If we're in an iframe, send a message to the parent window
    if (inIframe) {
      console.log("Success page loaded in iframe, notifying parent")
      try {
        // Tell the parent window that we've reached the success page
        window.parent.postMessage({ status: "success" }, "*")
        
        // Also attempt to send specific data from the URL if available
        const urlParams = new URLSearchParams(window.location.search)
        const orderId = urlParams.get('OrderMd')
        if (orderId) {
          window.parent.postMessage({ 
            status: "success", 
            orderId: orderId,
            message: "Transaction complete"
          }, "*")
        }
      } catch (e) {
        console.error("Error sending message to parent:", e)
      }
    }
    
    // If we reached this page directly, clean up any leftover order data
    if (!inIframe) {
      localStorage.removeItem('currentQuote')
      localStorage.removeItem('checkoutSession')
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
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-black">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold">Order Complete!</h1>
            
            <p className="text-gray-600">
              Your transaction has been successfully processed.
              You will receive a confirmation email shortly.
            </p>
            
            <div className="w-full space-y-3 mt-4">
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                onClick={() => router.push('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                onClick={() => router.push('/profile')}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                View My Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}