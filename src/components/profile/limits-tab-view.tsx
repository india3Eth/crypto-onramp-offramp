"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, Hash, DollarSign, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { CircularProgress } from "@/components/ui/circular-progress"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"
import type { KycLimits } from "@/types/kyc"

interface LimitsTabViewProps {
  kycLimits: KycLimits | null
  isRefreshing?: boolean
  onRefresh?: () => void
  level?: string
}

export function LimitsTabView({ kycLimits, isRefreshing = false, onRefresh, level }: LimitsTabViewProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Don't show if no limits data
  if (!kycLimits?.current?.levelLimits) {
    return null
  }

  const limits = kycLimits.current.levelLimits
  const currentLevel = level || kycLimits.current.levelName || 'Level 1'

  // Find limit data for active period
  const activeLimitData = limits.find(limit => limit.period === activeTab)
  
  if (!activeLimitData) {
    return null
  }

  const {
    reserveTransactions,
    reserveAmount,
    maxTransactions,
    maxAmount
  } = activeLimitData

  // Calculate used amounts and percentages
  const usedTransactions = maxTransactions - reserveTransactions
  const usedAmount = maxAmount - reserveAmount
  
  const transactionPercentage = maxTransactions > 0 ? (usedTransactions / maxTransactions) * 100 : 0
  const amountPercentage = maxAmount > 0 ? (usedAmount / maxAmount) * 100 : 0

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format compact currency for summary
  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(amount)
    }
    return formatCurrency(amount)
  }

  // Tab styling
  const getTabClass = (tab: string) => {
    const baseClass = "px-4 py-2 text-sm font-bold border-2 border-black transition-all"
    return activeTab === tab
      ? `${baseClass} bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`
      : `${baseClass} bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`
  }

  // Handle expand with scroll to top
  const handleExpand = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      // Scroll to top of card when expanding
      setTimeout(() => {
        const element = document.getElementById('transaction-limits-card')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  return (
    <Card id="transaction-limits-card" className={`${CARD_BRUTALIST_STYLE} p-6`}>
      {/* Clickable Header */}
      <div 
        className={`
          cursor-pointer rounded-lg p-4 -m-4 mb-4 transition-all duration-200 
          ${isExpanded 
            ? 'hover:bg-blue-50 border-l-4 border-blue-500' 
            : 'hover:bg-gray-50 hover:shadow-md'
          }
        `}
        onClick={handleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center border-2 border-black">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Transaction Limits</h3>
                <div className="flex items-center gap-2">
                  {onRefresh && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRefresh()
                      }}
                      disabled={isRefreshing}
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  <div className="p-1 rounded-full bg-gray-100 border border-gray-300">
                    {isExpanded ? (
                      <ChevronUp className="h-6 w-6 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {isExpanded ? (
                  <span className="font-medium">{currentLevel}</span>
                ) : (
                  <div className="space-y-1">
                    <div className="font-medium">{currentLevel} • {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Limits</div>
                    <div className="text-xs">
                      {reserveTransactions}/{maxTransactions} transactions • {formatCompactCurrency(reserveAmount)}/{formatCompactCurrency(maxAmount)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Period Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('daily')}
              className={getTabClass('daily')}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={getTabClass('weekly')}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={getTabClass('monthly')}
            >
              Monthly
            </button>
          </div>

          {/* Limits Content */}
          <div className="grid grid-cols-1 gap-6">
            {/* Transaction Limit */}
            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-300">
              <CircularProgress
                percentage={transactionPercentage}
                size={80}
                strokeWidth={8}
              >
                <Hash className="h-6 w-6 text-gray-600" />
              </CircularProgress>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Transactions</span>
                </div>
                <p className="text-xl font-bold mb-1">
                  {reserveTransactions} <span className="text-base text-gray-500 font-medium">of {maxTransactions}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {usedTransactions} used • {reserveTransactions} remaining
                </p>
              </div>
            </div>

            {/* Amount Limit */}
            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-300">
              <CircularProgress
                percentage={amountPercentage}
                size={80}
                strokeWidth={8}
              >
                <DollarSign className="h-6 w-6 text-gray-600" />
              </CircularProgress>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Amount</span>
                </div>
                <p className="text-xl font-bold mb-1">
                  {formatCurrency(reserveAmount)} <span className="text-base text-gray-500 font-medium">of {formatCurrency(maxAmount)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(usedAmount)} used • {formatCurrency(reserveAmount)} remaining
                </p>
              </div>
            </div>
          </div>

          {/* Period indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Limits reset {activeTab === 'daily' ? 'daily at midnight' : activeTab === 'weekly' ? 'weekly on Monday' : 'monthly on 1st'}</span>
          </div>
        </div>
      )}
    </Card>
  )
}