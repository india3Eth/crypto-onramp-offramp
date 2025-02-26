import { useState, useEffect } from "react"
import type { Quote, ExchangeFormData } from "@/types/exchange"
import { createQuote } from "@/app/actions/quote"

export function useQuote(formData: ExchangeFormData) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Function to fetch a new quote
  const fetchQuote = async () => {
    // Only fetch if we have an amount and it's greater than 0
    if (!formData.fromAmount || parseFloat(formData.fromAmount) <= 0) {
      setQuote(null)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await createQuote(formData)
      console.log("result : ", result)
      setQuote(result)
    } catch (err) {
      console.error("Error fetching quote:", err)
      setError("Failed to get quote. Please try again.")
      setQuote(null)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Refresh the quote on demand
  const refreshQuote = () => {
    fetchQuote()
  }
  
  // Fetch quote when form data changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [formData])
  
  return {
    quote,
    isLoading,
    error,
    refreshQuote
  }
}