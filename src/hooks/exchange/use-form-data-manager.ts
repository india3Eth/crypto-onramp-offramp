"use client"

import { useState, useEffect } from "react"
import type { QuoteRequest } from "@/types/exchange"

interface UseFormDataManagerProps {
  fiatOptions: string[]
  cryptoOptions: Array<{ id: string; network?: string }>
  isLoadingOptions: boolean
  mode?: "buy" | "sell"
}

export function useFormDataManager({
  fiatOptions,
  cryptoOptions,
  isLoadingOptions,
  mode = "buy"
}: UseFormDataManagerProps) {
  const [lastModifiedField, setLastModifiedField] = useState<"fromAmount" | "toAmount">("fromAmount")
  
  const [formData, setFormData] = useState<QuoteRequest>({
    fromAmount: "50",
    toAmount: "",
    fromCurrency: "USD",
    toCurrency: "USDT-BEP20", // Use the full currency format
    paymentMethodType: "CARD",
    chain: "",
  })
  
  // Handle swapping currencies and toggle between buy/sell
  const handleSwapCurrencies = () => {
    const newMode = mode === "buy" ? "sell" : "buy"
    
    if (newMode === "buy") {
      setFormData(prev => ({
        ...prev,
        fromAmount: "50",
        toAmount: "",
        fromCurrency: fiatOptions[0] || "USD",
        toCurrency: "USDT-BEP20",
        paymentMethodType: "CARD",
      }))
      setLastModifiedField("fromAmount");
    } else {
      setFormData(prev => ({
        ...prev,
        fromAmount: "",
        toAmount: "50",
        fromCurrency: "USDT-BEP20",
        toCurrency: fiatOptions[0] || "USD",
        paymentMethodType: "SEPA",
      }))
      setLastModifiedField("toAmount");
    }
  }
  
  // Update default currency values when options are loaded
  useEffect(() => {
    // Only update when we actually have data loaded
    if (isLoadingOptions || fiatOptions.length === 0 || cryptoOptions.length === 0) {
      return
    }
    
    if (mode === "buy") {
      setFormData(prev => ({
        ...prev,
        fromCurrency: fiatOptions.includes(prev.fromCurrency) ? prev.fromCurrency : fiatOptions[0],
        toCurrency: cryptoOptions.find(c => c.id === prev.toCurrency) ? prev.toCurrency : cryptoOptions[0]?.id || "USDT-BEP20",
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        fromCurrency: cryptoOptions.find(c => c.id === prev.fromCurrency) ? prev.fromCurrency : cryptoOptions[0]?.id || "USDT-BEP20",
        toCurrency: fiatOptions.includes(prev.toCurrency) ? prev.toCurrency : fiatOptions[0],
      }))
    }
  }, [isLoadingOptions, fiatOptions, cryptoOptions, mode])

  return {
    formData,
    lastModifiedField,
    setFormData,
    setLastModifiedField,
    handleSwapCurrencies
  }
}