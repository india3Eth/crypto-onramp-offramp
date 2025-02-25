"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RefreshRateDisplayProps {
  fromCurrency: string
  toCurrency: string
  rate: string | undefined
  onRefresh: () => void
  isLoading?: boolean
}

export function RefreshRateDisplay({ 
  fromCurrency, 
  toCurrency, 
  rate, 
  onRefresh,
  isLoading = false
}: RefreshRateDisplayProps) {
  const [countdown, setCountdown] = useState(10)
  
  useEffect(() => {
    // Reset countdown when component mounts or currencies change
    setCountdown(10)
    
    // Set up interval to countdown every second
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // When countdown reaches 0, trigger refresh
          onRefresh()
          return 10 // Reset timer
        }
        return prev - 1
      })
    }, 1000)
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId)
  }, [onRefresh, fromCurrency, toCurrency])
  
  // Calculate the displayed rate
  const displayRate = rate ? parseFloat(rate).toFixed(6) : "0.0000"
  const reverseRate = rate ? (1/parseFloat(rate)).toFixed(6) : "0.0000"
  
  return (
    <div className="w-full flex items-center justify-center relative h-12 bg-purple-400 rounded-md mb-4">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <RefreshCw size={20} className="animate-spin" />
          <span>Updating rate...</span>
        </div>
      ) : (
        <>
          {/* Countdown display in corner */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
            <Clock size={12} />
            <span className="text-xs font-medium">{countdown}s</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                onRefresh()
                setCountdown(10)
              }} 
              className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
            >
              <RefreshCw size={12} />
            </Button>
          </div>
          
          {/* Arrow icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-white"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </>
      )}
    </div>
  )
}