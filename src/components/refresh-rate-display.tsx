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
  countdownDuration?: number
}

export function RefreshRateDisplay({ 
  fromCurrency, 
  toCurrency, 
  rate, 
  onRefresh,
  isLoading = false,
  countdownDuration = 10
}: RefreshRateDisplayProps) {
  const [countdown, setCountdown] = useState(countdownDuration)
  
  useEffect(() => {
    // Reset countdown when component mounts or currencies change
    setCountdown(countdownDuration)
    
    // Set up interval to countdown every second
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // When countdown reaches 0, trigger refresh
          onRefresh()
          return countdownDuration // Reset timer
        }
        return prev - 1
      })
    }, 1000)
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId)
  }, [onRefresh, fromCurrency, toCurrency, countdownDuration])
  
  // If we're loading or don't have a rate yet, show a loading state
  if (isLoading || !rate) {
    return (
      <div className="w-full flex items-center justify-center relative h-12 bg-gray-100 rounded-md mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={20} className="animate-spin text-gray-500" />
          <span className="text-gray-600">Updating rate...</span>
        </div>
      </div>
    )
  }
  
  // Calculate the displayed rate
  const displayRate = parseFloat(rate).toFixed(6)
  const reverseRate = (1/parseFloat(rate)).toFixed(6)
  
  return (
    <div className="w-full flex items-center justify-between relative h-12 bg-gray-100 rounded-md mb-4 px-4">
      <span className="font-medium text-sm">
        1 {fromCurrency} = {displayRate} {toCurrency}
      </span>
      
      {/* Countdown display */}
      <div className="flex items-center gap-1 bg-white/70 rounded-full px-2 py-1">
        <Clock size={12} className="text-gray-500" />
        <span className="text-xs font-medium text-gray-600">{countdown}s</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            onRefresh()
            setCountdown(countdownDuration)
          }} 
          className="h-6 w-6 p-0 hover:bg-white/80 rounded-full"
        >
          <RefreshCw size={12} className="text-gray-600" />
        </Button>
      </div>
    </div>
  )
}