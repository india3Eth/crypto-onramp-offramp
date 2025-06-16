"use client"

import { useEffect, useRef } from "react"

interface UseQuoteRefreshProps {
  quote: { rate?: string } | null
  lastQuoteTimestamp?: number
  onCreateQuote: () => void
  isLoadingQuote: boolean
}

export function useQuoteRefresh({
  lastQuoteTimestamp,
  onCreateQuote,
  isLoadingQuote
}: UseQuoteRefreshProps) {
  const lastTimestampRef = useRef<number>(lastQuoteTimestamp || 0)
  
  // Reset timer when a new quote is received or refreshed
  useEffect(() => {
    // Check if we have a new quote by comparing timestamps
    if (lastQuoteTimestamp && lastQuoteTimestamp !== lastTimestampRef.current) {
      // Update our ref to the latest timestamp
      lastTimestampRef.current = lastQuoteTimestamp
    }
  }, [lastQuoteTimestamp])
  
  // Handle manual refresh - fixed to ensure it works
  const handleManualRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Call the quote refresh function directly
    if (!isLoadingQuote) {
      console.log("Manual refresh triggered")
      onCreateQuote()
      // No need to manually reset countdown - the hook will handle it
    }
  }

  return {
    handleManualRefresh
  }
}