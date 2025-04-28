"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Handle iframe navigation to detect URL changes
  useEffect(() => {
    // Observe iframe URL changes by hooking into the load event
    const handleIframeNavigation = () => {
      if (!iframeRef.current) return;
      
      try {
        // When iframe location changes, check if it contains "success" or "cancel" in the URL
        const iframeLocation = iframeRef.current.contentWindow?.location.href;
        
        if (iframeLocation) {
          console.log("Iframe navigation detected:", iframeLocation);
          
          if (iframeLocation.includes('/success') || 
              iframeLocation.includes('/order/success') ||
              iframeLocation.includes('result.html?OrderMd=')) {
            console.log("Success URL detected in iframe:", iframeLocation);
            // Detected success page, trigger completion
            if (onComplete) {
              onComplete();
            } else {
              // Default redirect to success page
              router.push('/order/success');
            }
          } else if (iframeLocation.includes('/cancel') || 
                    iframeLocation.includes('/order/cancel')) {
            console.log("Cancel URL detected in iframe:", iframeLocation);
            // Detected cancel page, redirect directly to cancel page
            router.push('/order/cancel');
          }
        }
      } catch (e) {
        // Security policies may prevent accessing iframe location
        // This is expected for cross-origin iframes
        console.log("Cannot access iframe location due to security restrictions");
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeNavigation);
      return () => {
        iframe.removeEventListener('load', handleIframeNavigation);
      };
    }
  }, [onComplete, onBack, router]);
  
  // Handle iframe messages for when payment is completed or canceled
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from iframe:", event.data);
      
      // Check for completion message
      if (event.data && (
          event.data.status === "success" || 
          event.data.status === "completed" ||
          event.data.paymentStatus === "success" ||
          // Check for URLs containing success indicators
          (typeof event.data === 'string' && (
            event.data.includes('/success') || 
            event.data.includes('result.html?OrderMd=')
          ))
      )) {
        console.log("Success event detected from iframe");
        if (onComplete) {
          onComplete();
        } else {
          // Default redirect to success page
          router.push('/order/success');
        }
      }
      
      // Check for cancelation or failure
      if (event.data && (
          event.data.status === "cancelled" || 
          event.data.status === "canceled" ||
          event.data.status === "failed" ||
          event.data.paymentStatus === "cancelled" ||
          event.data.paymentStatus === "failed" ||
          // Check for URLs containing cancel indicators
          (typeof event.data === 'string' && (
            event.data.includes('/cancel') || 
            event.data.includes('/failed')
          ))
      )) {
        console.log("Cancel event detected from iframe");
        // Direct redirect to cancel page instead of using onBack
        router.push('/order/cancel');
      }
    };
    
    window.addEventListener("message", handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onComplete, onBack, router]);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // After iframe loads, check if we can detect a success or cancel page
    if (iframeRef.current) {
      try {
        const iframeWindow = iframeRef.current.contentWindow;
        const iframeLocation = iframeWindow?.location.href;
        
        console.log("Iframe loaded:", iframeLocation);
        
        if (iframeLocation) {
          // Try to check if it's a success page
          if (iframeLocation.includes('/success') || 
              iframeLocation.includes('result.html?OrderMd=')) {
            console.log("Success URL detected on iframe load:", iframeLocation);
            // Redirect to success page after a short delay
            setTimeout(() => {
              if (onComplete) onComplete();
              else router.push('/order/success');
            }, 500);
          }
          
          // Try to check if it's a cancel page
          else if (iframeLocation.includes('/cancel')) {
            console.log("Cancel URL detected on iframe load:", iframeLocation);
            // Redirect directly to cancel page
            setTimeout(() => {
              router.push('/order/cancel');
            }, 500);
          }
        }
      } catch (e) {
        // Expected error for cross-origin iframes
        console.log("Cannot access iframe location due to security restrictions");
      }
    }
  };
  
  // Check URL parameters for cancel on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cancel')) {
      console.log("Cancel parameter detected in URL");
      router.push('/order/cancel');
    }
  }, [router]);
  
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
          ref={iframeRef}
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