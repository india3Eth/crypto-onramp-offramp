"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getKycWidgetUrl } from "@/app/actions/kyc-widget"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface KycWidgetIframeProps {
  kycLevel?: number
  onBack?: () => void
  onComplete?: () => void
}

export function KycWidgetIframe({ 
  kycLevel = 2, 
  onBack,
  onComplete 
}: KycWidgetIframeProps) {
  const router = useRouter()
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadWidget = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get the KYC widget URL from the server action
        const result = await getKycWidgetUrl(kycLevel, "/profile", "/profile")
        
        if (result.success && result.fullUrl) {
          setWidgetUrl(result.fullUrl)
        } else {
          throw new Error(result.message || "Failed to get KYC widget URL")
        }
      } catch (error) {
        console.error("Error loading KYC widget:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWidget()
  }, [kycLevel])
  
  // Handle iframe messages for when KYC is completed
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check for KYC completion message from the iframe
      // Note: You may need to adjust this based on actual messages sent by the KYC provider
      if (event.data && event.data.kycStatus === "completed") {
        if (onComplete) {
          onComplete()
        } else {
          // Redirect to profile page by default
          router.push("/profile")
        }
      }
    }
    
    window.addEventListener("message", handleMessage)
    
    // Cleanup
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [onComplete, router])
  
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner text="Loading KYC widget..." />
      </div>
    )
  }
  
  if (error) {
    return (
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center border-2 border-black">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Error Loading KYC</h1>
          <p className="text-center text-gray-600">
            {error}
          </p>
          <Button 
            onClick={handleBack}
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </Card>
    )
  }
  
  if (!widgetUrl) {
    return null
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
      <div className="w-full border-4 border-black rounded-lg overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
        <iframe
          src={widgetUrl}
          width="100%"
          height="480"
          className="w-full h-[480px]"
          allow="camera; microphone"
        />
      </div>
    </div>
  )
}