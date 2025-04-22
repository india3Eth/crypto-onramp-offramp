"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface CheckoutIframeProps {
  checkoutUrl: string
  onBack?: () => void
  onComplete?: () => void
}

export function CheckoutIframe({ 
  checkoutUrl, 
  onBack,
  onComplete 
}: CheckoutIframeProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Handle iframe messages for when payment is completed or canceled
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check for completion message
      if (event.data && (
          event.data.status === "success" || 
          event.data.status === "completed" ||
          event.data.paymentStatus === "success"
      )) {
        if (onComplete) {
          onComplete()
        }
      }
      
      // Check for cancelation or failure
      if (event.data && (
          event.data.status === "cancelled" || 
          event.data.status === "canceled" ||
          event.data.status === "failed" ||
          event.data.paymentStatus === "cancelled" ||
          event.data.paymentStatus === "failed"
      )) {
        if (onBack) {
          onBack()
        }
      }
    }
    
    window.addEventListener("message", handleMessage)
    
    // Cleanup
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [onComplete, onBack])
  
  const handleBack = () => {
    if (onBack) {
      onBack()
    }
  }
  
  const handleIframeLoad = () => {
    setIsLoading(false)
  }
  
  if (!checkoutUrl) {
    return (
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center border-2 border-black">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Checkout URL Missing</h1>
          <p className="text-center text-gray-600">
            No checkout URL was provided to process your payment.
          </p>
          <Button 
            onClick={handleBack}
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </Card>
    )
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-0 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center z-10 bg-white/80">
            <LoadingSpinner text="Loading payment page..." />
          </div>
        )}
        
        <iframe
          src={checkoutUrl}
          width="100%"
          height="600"
          className="w-full h-[600px] border-none"
          onLoad={handleIframeLoad}
          allow="camera; microphone; payment"
        />
      </Card>
    </div>
  )
}