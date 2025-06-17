"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { IFRAME_TIMEOUT_MS, IFRAME_SUCCESS_DELAY_MS, CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

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
  const [, setError] = useState<string | null>(null)
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasCompletedRef = useRef(false) // Prevent multiple completion calls
  
  // Consolidated completion handler
  const handleCompletion = (isSuccess: boolean) => {
    if (hasCompletedRef.current) return; // Prevent multiple calls
    hasCompletedRef.current = true;
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isSuccess) {
      if (onComplete) {
        onComplete();
      } else {
        router.push('/order/success');
      }
    } else {
      router.push('/order/cancel');
    }
  };
  
  // Handle iframe navigation to detect URL changes
  useEffect(() => {
    const handleIframeNavigation = () => {
      if (!iframeRef.current || hasCompletedRef.current) return;
      
      try {
        const iframeLocation = iframeRef.current.contentWindow?.location.href;
        
        if (iframeLocation) {
          if (iframeLocation.includes('/success') || 
              iframeLocation.includes('/order/success') ||
              iframeLocation.includes('result.html?OrderMd=')) {
            handleCompletion(true);
          } else if (iframeLocation.includes('/cancel') || 
                    iframeLocation.includes('/order/cancel')) {
            handleCompletion(false);
          }
        }
      } catch (e) {
        // Security policies may prevent accessing iframe location
        // This is expected for cross-origin iframes
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeNavigation);
      return () => {
        iframe.removeEventListener('load', handleIframeNavigation);
      };
    }
  }, []);
  
  // Add iframe timeout handling
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
      setError("Payment page timed out. Please try again.");
      setIsLoading(false);
    }, IFRAME_TIMEOUT_MS);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkoutUrl]);
  
  // Handle iframe messages for when payment is completed or canceled
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (hasCompletedRef.current) return; // Prevent processing after completion
      
      // Check for completion message
      const isSuccess = event.data && (
        event.data.status === "success" || 
        event.data.status === "completed" ||
        event.data.paymentStatus === "success" ||
        // Check for URLs containing success indicators
        (typeof event.data === 'string' && (
          event.data.includes('/success') || 
          event.data.includes('result.html?OrderMd=')
        ))
      );
      
      // Check for cancelation or failure
      const isCancel = event.data && (
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
      );
      
      if (isSuccess) {
        handleCompletion(true);
      } else if (isCancel) {
        handleCompletion(false);
      }
    };
    
    window.addEventListener("message", handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // After iframe loads, check if we can detect a success or cancel page
    if (iframeRef.current && !hasCompletedRef.current) {
      try {
        const iframeWindow = iframeRef.current.contentWindow;
        const iframeLocation = iframeWindow?.location.href;
        
        if (iframeLocation) {
          // Try to check if it's a success page
          if (iframeLocation.includes('/success') || 
              iframeLocation.includes('result.html?OrderMd=')) {
            setTimeout(() => {
              handleCompletion(true);
            }, IFRAME_SUCCESS_DELAY_MS);
          }
          
          // Try to check if it's a cancel page
          else if (iframeLocation.includes('/cancel')) {
            setTimeout(() => {
              handleCompletion(false);
            }, IFRAME_SUCCESS_DELAY_MS);
          }
        }
      } catch (e) {
        // Expected error for cross-origin iframes
      }
    }
  };
  
  // Check URL parameters for cancel on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cancel')) {
      router.push('/order/cancel');
    }
  }, [router]);
  
  if (!checkoutUrl || hasTimedOut) {
    return (
      <Card className={`${CARD_BRUTALIST_STYLE} p-6`}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center border-2 border-black">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">
            {hasTimedOut ? "Payment Timeout" : "Checkout URL Missing"}
          </h1>
          <p className="text-center text-gray-600">
            {hasTimedOut 
              ? "The payment page took too long to load. Please try again." 
              : "No checkout URL was provided to process your payment."
            }
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
      
      <Card className={`${CARD_BRUTALIST_STYLE} p-0 overflow-hidden`}>
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