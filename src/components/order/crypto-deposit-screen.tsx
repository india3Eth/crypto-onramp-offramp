"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import QRCode from 'qrcode'
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

interface CryptoDepositScreenProps {
  orderData: {
    transactionId: string
    fromAmount: string
    fromCurrency: string
    toCurrency: string
    chain: string
    depositAddress: string
    expiration: string
    memo?: string
  }
  onCancel: () => void
  onConfirmSent: () => void
}

export function CryptoDepositScreen({
  orderData,
  onCancel,
  onConfirmSent
}: CryptoDepositScreenProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  // Countdown timer for order expiration
  const expirationTime = new Date(orderData.expiration).getTime()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Calculate initial time remaining in seconds
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000))
      setTimeRemaining(remaining)
    }

    // Update immediately
    updateTimeRemaining()

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [expirationTime])

  // Generate QR code for the deposit address
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Create a simple address QR code (can be enhanced with amount if wallet supports it)
        const qrUrl = await QRCode.toDataURL(orderData.depositAddress, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 160 // Reduced size for mobile
        })
        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    if (orderData.depositAddress) {
      generateQRCode()
    }
  }, [orderData.depositAddress])

  // Format network name for display
  const formatNetworkName = (chain: string): string => {
    const networkMap: Record<string, string> = {
      'ERC20': 'Ethereum network',
      'BEP20': 'BSC network',
      'TRC20': 'Tron network',
      'POLYGON': 'Polygon network'
    }
    return networkMap[chain] || `${chain} network`
  }

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const isExpired = timeRemaining <= 0

  return (
    <div className="max-h-screen overflow-y-auto">
      <Card className={CARD_BRUTALIST_STYLE}>
        <CardHeader className="text-center pb-4">
          {/* Countdown Timer */}
          <div className="mx-auto mb-3">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 ${
              isExpired 
                ? "border-red-500 bg-red-50" 
                : timeRemaining < 300 
                  ? "border-orange-500 bg-orange-50" 
                  : "border-green-500 bg-green-50"
            }`}>
              <span className={`text-sm font-bold ${
                isExpired 
                  ? "text-red-600" 
                  : timeRemaining < 300 
                    ? "text-orange-600" 
                    : "text-green-600"
              }`}>
                {isExpired ? "00:00" : formatTimeRemaining(timeRemaining)}
              </span>
            </div>
          </div>

          <CardTitle className="text-xl font-bold mb-2 leading-tight">
            Send {orderData.fromCurrency}-{orderData.chain} on {formatNetworkName(orderData.chain)}
          </CardTitle>
          
          <p className="text-gray-600 text-sm px-2">
            Open your crypto wallet and scan the QR code, or copy the {orderData.fromCurrency}-{orderData.chain} address below to make a payment
          </p>
        </CardHeader>

        <CardContent className="space-y-4 px-4">
          {/* QR Code */}
          {qrCodeUrl && (
            <div className="flex justify-center">
              <div className="p-3 bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                <img 
                  src={qrCodeUrl} 
                  alt="Deposit Address QR Code" 
                  className="w-40 h-40"
                />
              </div>
            </div>
          )}

          {/* Address Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {orderData.fromCurrency}-{orderData.chain} address
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-50 border-2 border-gray-300 rounded-md">
                  <span className="text-xs font-mono break-all leading-tight">
                    {orderData.depositAddress}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 min-w-[40px] h-8"
                  onClick={() => copyToClipboard(orderData.depositAddress, 'address')}
                >
                  {copiedField === 'address' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total amount
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-50 border-2 border-gray-300 rounded-md">
                  <span className="text-sm font-bold">
                    {orderData.fromAmount} {orderData.fromCurrency}-{orderData.chain}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 min-w-[40px] h-8"
                  onClick={() => copyToClipboard(orderData.fromAmount, 'amount')}
                >
                  {copiedField === 'amount' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Memo field if present */}
            {orderData.memo && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Memo/Tag
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-2 bg-gray-50 border-2 border-gray-300 rounded-md">
                    <span className="text-xs font-mono">
                      {orderData.memo}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 min-w-[40px] h-8"
                    onClick={() => copyToClipboard(orderData.memo!, 'memo')}
                  >
                    {copiedField === 'memo' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Warning if expired */}
          {isExpired && (
            <div className="p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Order Expired</p>
                <p className="text-xs">This order has expired. Please create a new order to continue.</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3">
            <Button
              variant="outline"
              className="w-full sm:flex-1 border-2 border-gray-300 hover:border-gray-400 font-bold h-10"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:flex-1 bg-green-500 hover:bg-green-600 text-white font-bold border-2 border-green-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all h-10"
              onClick={onConfirmSent}
              disabled={isExpired}
            >
              I sent coins
            </Button>
          </div>

          {/* Transaction ID for reference */}
          <div className="pt-3 border-t text-center">
            <p className="text-xs text-gray-500">
              Transaction ID: {orderData.transactionId}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}