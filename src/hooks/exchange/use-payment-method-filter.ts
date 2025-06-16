"use client"

import { useState, useEffect } from "react"
import type { QuoteRequest } from "@/types/exchange"

interface UsePaymentMethodFilterProps {
  mode: "buy" | "sell"
  formData: QuoteRequest
  paymentMethods: Array<{ id: string; onRampSupported?: boolean; offRampSupported?: boolean; onramp?: string[]; offramp?: string[] }>
  onFormDataChange: (newFormData: QuoteRequest) => void
}

export function usePaymentMethodFilter({
  mode,
  formData,
  paymentMethods,
  onFormDataChange
}: UsePaymentMethodFilterProps) {
  const [filteredPaymentMethods, setFilteredPaymentMethods] = useState<Array<{ id: string; onRampSupported?: boolean; offRampSupported?: boolean; onramp?: string[]; offramp?: string[] }>>([])
  
  useEffect(() => {
    const currencyToCheck = mode === "buy" 
      ? formData.fromCurrency  // For buy flow, check fromCurrency (fiat)
      : formData.toCurrency    // For sell flow, check toCurrency (fiat)
    
    // Filter payment methods that support the selected currency
    const filtered = paymentMethods.filter(method => {
      // First, check if the method supports the current mode (buy/sell)
      const supportsMode = mode === "buy" 
        ? method.onRampSupported 
        : method.offRampSupported
      
      // Then check if it supports the selected currency using the new arrays
      const supportsCurrency = mode === "buy"
        ? Array.isArray(method.onramp) && method.onramp.includes(currencyToCheck)
        : Array.isArray(method.offramp) && method.offramp.includes(currencyToCheck)
      
      return supportsMode && supportsCurrency
    })
    
    setFilteredPaymentMethods(filtered)
    
    // If current payment method is not in filtered list, select the first available one
    if (filtered.length > 0 && !filtered.some(m => m.id === formData.paymentMethodType)) {
      onFormDataChange({
        ...formData,
        paymentMethodType: filtered[0].id
      })
    }
  }, [mode, formData.fromCurrency, formData.toCurrency, paymentMethods, onFormDataChange, formData])

  const hasNoMethods = filteredPaymentMethods.length === 0
  const noMethodsMessage = hasNoMethods 
    ? `No payment methods support ${mode === "buy" ? formData.fromCurrency : formData.toCurrency} for ${mode === "buy" ? "buying" : "selling"}. Try another currency.`
    : undefined

  return {
    filteredPaymentMethods,
    hasNoMethods,
    noMethodsMessage
  }
}