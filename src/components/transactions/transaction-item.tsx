"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  ExternalLink,
  Calendar,
  Hash,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import type { Transaction, OnrampTransaction, OfframpTransaction } from "@/types/exchange/transaction"
import { isOnrampTransaction } from "@/types/exchange/transaction"

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const isOnramp = isOnrampTransaction(transaction)

  // Auto scroll to top of card when expanding
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      cardRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }, [isExpanded])
  
  // Format currency amounts
  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount)
    if (currency.includes('USD') || currency.includes('EUR')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.includes('USD') ? 'USD' : 'EUR',
        minimumFractionDigits: 2
      }).format(num)
    }
    return `${parseFloat(amount).toFixed(6)} ${currency}`
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ON_CHAIN_COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'CREATED':
      case 'FIAT_DEPOSIT_RECEIVED':
      case 'TRADE_COMPLETED':
      case 'ON_CHAIN_INITIATED':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ON_CHAIN_COMPLETED':
        return <CheckCircle className="h-3 w-3" />
      case 'FAILED':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }
  
  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Get blockchain explorer URL based on currency
  const getBlockchainExplorerUrl = (txHash: string, currency: string) => {
    if (currency.includes('BEP20') || currency.includes('BSC')) {
      return `https://testnet.bscscan.com/tx/${txHash}`
    } else if (currency.includes('ERC20') || currency.includes('ETH')) {
      return `https://etherscan.io/tx/${txHash}`
    } else if (currency.includes('POLYGON') || currency.includes('MATIC')) {
      return `https://polygonscan.com/tx/${txHash}`
    } else if (currency.includes('ARBITRUM')) {
      return `https://arbiscan.io/tx/${txHash}`
    } else if (currency.includes('OPTIMISM')) {
      return `https://optimistic.etherscan.io/tx/${txHash}`
    } else if (currency.includes('AVAX') || currency.includes('AVALANCHE')) {
      return `https://snowtrace.io/tx/${txHash}`
    } else if (currency.includes('BTC') || currency.includes('BITCOIN')) {
      return `https://blockstream.info/tx/${txHash}`
    }
    // Default to BSC since most tokens are BEP20 in the example
    return `https://bscscan.com/tx/${txHash}`
  }
  
  // Calculate total fees (excluding markup fees)
  const totalFees = transaction.quote.fees.filter(fee => fee.type !== "markupFee").reduce((sum, fee) => sum + parseFloat(fee.amount), 0)
  
  return (
    <div ref={cardRef} className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200 overflow-hidden">
      {/* Compact Header */}
      <div 
        className="cursor-pointer p-4 hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Transaction Type Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isOnramp ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {isOnramp ? (
                <ArrowDownRight className="h-6 w-6 text-green-600" />
              ) : (
                <ArrowUpRight className="h-6 w-6 text-blue-600" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg text-gray-900">
                      {isOnramp ? 'Buy' : 'Sell'} {transaction.toCurrency}
                    </span>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getStatusStyle(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatAmount(transaction.fromAmount, transaction.fromCurrency)} → {formatAmount(transaction.toAmount, transaction.toCurrency)}
                  </div>
                </div>
                
                <div className="text-right ml-3 flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {formatDate(transaction.createdAt)}
                  </div>
                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="space-y-4 pt-4">
            {/* Transaction ID */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Hash className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Transaction ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-900 truncate">{transaction.transactionId}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.transactionId)}
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Hash - Show only if txHash exists and transaction is completed */}
            {transaction.txHash && transaction.status === 'ON_CHAIN_COMPLETED' && (
              <div className="bg-white rounded-xl p-4 border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ExternalLink className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Blockchain Transaction</p>
                    <div className="flex items-start gap-2 mb-2">
                      <p className="text-sm font-mono text-gray-900 break-all leading-relaxed">{transaction.txHash}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.txHash!)}
                        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const explorerUrl = getBlockchainExplorerUrl(transaction.txHash!, transaction.toCurrency)
                        if (explorerUrl) {
                          window.open(explorerUrl, '_blank')
                        }
                      }}
                      className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Explorer
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Payment Method */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{transaction.paymentMethodType}</p>
                  </div>
                </div>
              </div>

              {/* Exchange Rate */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Rate</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {parseFloat(transaction.quote.rate).toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Wallet className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {isOnramp ? 'Deposit Address' : 'Wallet Address'}
                  </p>
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-mono text-gray-900 break-all leading-relaxed">
                      {isOnramp 
                        ? (transaction as OnrampTransaction).depositAddress 
                        : (transaction as OfframpTransaction).userWalletAddress
                      }
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        isOnramp 
                          ? (transaction as OnrampTransaction).depositAddress 
                          : (transaction as OfframpTransaction).userWalletAddress
                      )}
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Fees Breakdown */}
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Fees Breakdown</p>
              <div className="space-y-2">
                {transaction.quote.fees.filter(fee => fee.type !== "markupFee").map((fee, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 capitalize">{fee.type.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <span className="text-sm font-medium text-gray-900">{formatAmount(fee.amount, fee.currency)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Total Fees</span>
                    <span className="text-sm font-bold text-gray-900">{formatAmount(totalFees.toString(), transaction.quote.fees.filter(fee => fee.type !== "markupFee")[0]?.currency || 'USD')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Created</p>
                    <p className="text-sm text-gray-900">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Updated</p>
                    <p className="text-sm text-gray-900">{new Date(transaction.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}