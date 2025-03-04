"use client"

import { useState, useEffect, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Wallet, RefreshCw, Clock, AlertCircle, Download, Loader2 } from "lucide-react"
import type { Quote, ExchangeFormData } from "@/types/exchange"
import { useQuote } from "@/hooks/use-quote"
import { fetchAndStoreConfigs } from "@/app/actions/config"

// Define interfaces for API responses
interface CryptoOption {
  id: string;
  network?: string;
  chain?: string;
  paymentMethods: string[];
  supportedFiatCurrencies: string[];
}

interface PaymentMethodOption {
  id: string;
  onRampSupported: boolean;
  offRampSupported: boolean;
  availableFiatCurrencies: string[];
}

interface ApiResponse<T> {
  success: boolean;
  count: number;
  error?: string;
  [key: string]: any;
}

export default function HomePage() {
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  const [countdown, setCountdown] = useState(10)
  const [formData, setFormData] = useState<ExchangeFormData>({
    fromAmount: "50",
    fromCurrency: "USD",
    toCurrency: "USDT",
    paymentMethodType: "CARD",
    chain: "BEP20",
  })
  
  // Config update state
  const [isPending, startTransition] = useTransition()
  const [configResult, setConfigResult] = useState<{ success?: boolean; message?: string } | null>(null)
  
  // API data state
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([])
  const [fiatOptions, setFiatOptions] = useState<string[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  
  // Use the custom hook for quote fetching
  const { quote, isLoading, error, refreshInterval ,refreshQuote } = useQuote(formData)
  
  // Fetch crypto options based on mode (buy/sell)
  useEffect(() => {
    const fetchCryptoOptions = async () => {
      try {
        setIsLoadingOptions(true)
        setOptionsError(null)
        
        // Fetch crypto options based on current mode
        const endpoint = mode === "buy" ? "/api/crypto/onramp" : "/api/crypto/offramp"
        const response = await fetch(endpoint)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch crypto options: ${response.statusText}`)
        }
        
        const data = await response.json() as ApiResponse<CryptoOption[]>
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch crypto options")
        }
        
        setCryptoOptions(data.cryptos || [])
      } catch (err) {
        console.error("Error fetching crypto options:", err)
        setOptionsError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoadingOptions(false)
      }
    }
    
    fetchCryptoOptions()
  }, [mode])
  
  // Fetch payment methods based on mode (buy/sell)
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        // Only set loading if we don't already have payment methods
        if (paymentMethods.length === 0) {
          setIsLoadingOptions(true)
        }
        setOptionsError(null)
        
        const response = await fetch(`/api/crypto/payment-methods?type=${mode === "buy" ? "onramp" : "offramp"}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch payment methods: ${response.statusText}`)
        }
        
        const data = await response.json() as ApiResponse<PaymentMethodOption[]>
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch payment methods")
        }
        
        setPaymentMethods(data.paymentMethods || [])
        
        // Extract unique fiat currencies from payment methods
        const uniqueFiatCurrencies = new Set<string>()
        data.paymentMethods.forEach((method: { availableFiatCurrencies: any[] }) => {
          method.availableFiatCurrencies.forEach(currency => uniqueFiatCurrencies.add(currency))
        })
        
        setFiatOptions(Array.from(uniqueFiatCurrencies).sort())
      } catch (err) {
        console.error("Error fetching payment methods:", err)
        setOptionsError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoadingOptions(false)
      }
    }
    
    fetchPaymentMethods()
  }, [mode])
  
  // Handle amount input change
  const handleAmountChange = (value: string) => {
    setFormData(prev => ({ ...prev, fromAmount: value }))
  }
  
  // Handle swapping currencies and toggle between buy/sell
  const handleSwapCurrencies = () => {
    // Toggle mode between buy and sell
    const newMode = mode === "buy" ? "sell" : "buy"
    setMode(newMode)
    
    // Reset form data based on new mode
    // Will be populated with default values after options are loaded
    if (newMode === "buy") {
      setFormData(prev => ({
        ...prev,
        fromCurrency: fiatOptions[0] || "USD",
        toCurrency: "USDT",
        paymentMethodType: "CARD",
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        fromCurrency: "USDT",
        toCurrency: fiatOptions[0] || "USD",
        paymentMethodType: "SEPATRANSFER",
      }))
    }
  }
  
  // Handle update configs button click
  const handleUpdateConfigs = () => {
    setConfigResult(null)
    startTransition(async () => {
      const result = await fetchAndStoreConfigs()
      setConfigResult(result)
    })
  }
// Set up countdown timer for quote refresh
useEffect(() => {
  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        refreshQuote()
        return refreshInterval
      }
      return prev - 1
    })
  }, 1000)
  
  return () => clearInterval(timer)
}, [refreshQuote])  
  // Update default currency values when options are loaded
  useEffect(() => {
    // Skip if no options loaded yet or if loading
    if (isLoadingOptions || fiatOptions.length === 0 || cryptoOptions.length === 0) {
      return
    }
    
    // Set defaults based on mode
    if (mode === "buy") {
      setFormData(prev => ({
        ...prev,
        // Use the first available options if current selections are not available
        fromCurrency: fiatOptions.includes(prev.fromCurrency) ? prev.fromCurrency : fiatOptions[0],
        toCurrency: cryptoOptions.find(c => c.id === prev.toCurrency) ? prev.toCurrency : cryptoOptions[0]?.id || "USDT",
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        fromCurrency: cryptoOptions.find(c => c.id === prev.fromCurrency) ? prev.fromCurrency : cryptoOptions[0]?.id || "BTC",
        toCurrency: fiatOptions.includes(prev.toCurrency) ? prev.toCurrency : fiatOptions[0],
      }))
    }
  }, [isLoadingOptions, fiatOptions, cryptoOptions, mode])

  return (
    <div className="flex flex-col gap-4">
      {/* Exchange card */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{mode === "buy" ? "Buy Crypto" : "Sell Crypto"}</h2>
            <Wallet className="h-6 w-6" />
          </div>

          {/* Loading state for options */}
          {isLoadingOptions && (
            <div className="flex justify-center items-center p-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                <p className="text-gray-500">Loading exchange options...</p>
              </div>
            </div>
          )}

          {/* Options error */}
          {optionsError && (
            <div className="p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>{optionsError}</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2 border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoadingOptions && !optionsError && (
            <>
              {/* From currency */}
              <div className="space-y-2">
                <label className="font-bold">{mode === "buy" ? "You Pay" : "You Send"}</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.fromAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="flex-grow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
                    placeholder="0.00"
                  />
                  <Select
                    value={formData.fromCurrency}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, fromCurrency: value }))}
                  >
                    <SelectTrigger className="w-[100px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                      {mode === "buy" ? (
                        fiatOptions.map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))
                      ) : (
                        cryptoOptions.map(crypto => (
                          <SelectItem key={crypto.id} value={crypto.id}>
                            {crypto.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom swap button with timer and rate display */}
              <div className="relative flex items-center border-2 border-black rounded-md p-2">
                {/* Left side - Toggle button */}
                <button 
                  onClick={handleSwapCurrencies}
                  className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 transition-all"
                >
                  <ArrowUpDown className="h-6 w-6" />
                </button>
                
                {/* Middle - Rate display */}
                <div className="flex-grow text-center">
                  {error ? (
                    <div className="flex items-center justify-center text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Error getting quote</span>
                    </div>
                  ) : isLoading ? (
                    <span className="text-sm font-medium">Loading rates...</span>
                  ) : quote ? (
                    <span className="text-sm font-medium">
                      1 {formData.fromCurrency} = {Number(quote.rate).toFixed(4)} {formData.toCurrency}
                    </span>
                  ) : (
                    <span className="text-sm font-medium">
                      <button 
                        onClick={refreshQuote}
                        className="text-blue-500 hover:underline flex items-center justify-center mx-auto"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Get quote
                      </button>
                    </span>
                  )}
                </div>
                
                {/* Right side - Timer */}
                <div className="bg-yellow-300 px-3 py-1 rounded-full border-2 border-black flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">{countdown}s</span>
                  <button 
                    onClick={() => {
                      refreshQuote()
                      setCountdown(10)
                    }}
                    className="ml-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* To currency */}
              <div className="space-y-2">
                <label className="font-bold">{mode === "buy" ? "You Get" : "You Receive"}</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={isLoading ? "Loading..." : error ? "Error" : quote?.toAmount || "0.00"}
                    readOnly
                    className="flex-grow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] bg-gray-100"
                  />
                  <Select
                    value={formData.toCurrency}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, toCurrency: value }))}
                  >
                    <SelectTrigger className="w-[100px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                      {mode === "buy" ? (
                        cryptoOptions.map(crypto => (
                          <SelectItem key={crypto.id} value={crypto.id}>
                            {crypto.id}
                          </SelectItem>
                        ))
                      ) : (
                        fiatOptions.map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <label className="font-bold">{mode === "buy" ? "Payment Method" : "Payout Method"}</label>
                <Select
                  value={formData.paymentMethodType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethodType: value }))}
                >
                  <SelectTrigger className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span>{formData.paymentMethodType}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                    {paymentMethods
                      .filter(method => mode === "buy" ? method.onRampSupported : method.offRampSupported)
                      .map(method => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.id.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error display */}
              {error && (
                <div className="p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md">
                  {error}
                </div>
              )}

              {/* Continue button */}
              <Button
                className={`w-full text-white font-bold py-3 transition-transform active:translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] ${
                  mode === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
                disabled={!quote || isLoading}
                onClick={() => window.location.href = "/login"}
              >
                {isLoading ? "Getting quote..." : "Continue"}
              </Button>
            </>
          )}
          
          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-4"></div>
          
          {/* Update configs button and status */}
          <div className="space-y-3">
            <Button
              onClick={handleUpdateConfigs}
              disabled={isPending}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 transition-transform active:translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
            >
              {isPending ? (
                <span className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating Configs...
                </span>
              ) : (
                <span className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Update Configurations
                </span>
              )}
            </Button>
            
            {/* Config update result message */}
            {configResult && (
              <div className={`p-3 border-2 rounded-md ${
                configResult.success 
                  ? "bg-green-100 text-green-600 border-green-600" 
                  : "bg-red-100 text-red-600 border-red-600"
              }`}>
                <p className="text-sm">{configResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}