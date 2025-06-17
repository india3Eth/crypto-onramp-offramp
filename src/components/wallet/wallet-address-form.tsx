"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Wallet, AlertCircle, ArrowRight, CheckCircle, ExternalLink, Copy } from "lucide-react"
import { validateWalletAddress } from "@/utils/crypto/wallet-validator"

interface WalletAddressFormProps {
  onSubmit: (walletAddress: string, isValid: boolean) => void
}

export function WalletAddressForm({ onSubmit }: WalletAddressFormProps) {
  const [walletAddress, setWalletAddress] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [cryptoCode, setCryptoCode] = useState<string>("ETH") // Default to ETH
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)
  
  // Get the quote data from localStorage to determine crypto type
  useEffect(() => {
    const savedQuote = localStorage.getItem('currentQuote')
    if (savedQuote) {
      try {
        const quoteData = JSON.parse(savedQuote)
        // Determine which crypto code to use for validation
        if (quoteData.mode === "buy") {
          setCryptoCode(quoteData.toCurrency)
        } else {
          setCryptoCode(quoteData.fromCurrency)
        }
        
        // Pre-fill wallet address if already set in the quote
        if (quoteData.depositAddress) {
          setWalletAddress(quoteData.depositAddress)
        }
      } catch (e) {
        console.error('Error parsing quote data:', e)
      }
    }
  }, [])
  
  // Handle wallet address change
  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value)
    // Clear validation error when user types
    if (validationError) {
      setValidationError(null)
    }
  }
  
  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setWalletAddress(text)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }
  
  // Validate the wallet address
  const validateAddress = () => {
    const validation = validateWalletAddress(walletAddress, cryptoCode)
    
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Invalid wallet address')
      return false
    }
    
    setValidationError(null)
    return true
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const isValid = validateAddress()
      
      if (isValid) {
        onSubmit(walletAddress, true)
      } else {
        setIsSubmitting(false)
      }
    } catch (error) {
      setValidationError('An error occurred while validating the address')
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white">
      <CardHeader>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center border-2 border-black mb-4">
            <Wallet className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Enter Your Wallet Address</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Please provide the wallet address where you want to receive your cryptocurrency
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="walletAddress" className="font-bold">
                {cryptoCode} Wallet Address
              </label>
              
              <div className="flex items-center text-sm text-gray-500">
                <ExternalLink className="h-3 w-3 mr-1" />
                <a 
                  href={`https://academy.binance.com/en/articles/crypto-wallet-types-explained`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  What is a wallet address?
                </a>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-grow relative">
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={handleWalletAddressChange}
                  placeholder={cryptoCode === "ETH" ? "0x..." : "Enter wallet address"}
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] pr-10"
                />
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePaste}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
              >
                {hasCopied ? (
                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                Paste
              </Button>
            </div>
            
            {validationError && (
              <div className="p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{validationError}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-500 mt-1">
              <p>
                Make sure you're sending to the correct address on the {cryptoCode} network. 
                Sending to wrong address may result in permanent loss of funds.
              </p>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
            disabled={isSubmitting || !walletAddress.trim()}
          >
            {isSubmitting ? "Validating..." : (
              <>
                Continue to Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}