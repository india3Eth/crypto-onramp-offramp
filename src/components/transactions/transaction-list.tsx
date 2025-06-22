"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TransactionItem } from "./transaction-item"
import { ArrowDownRight, ArrowUpRight, RefreshCw, AlertCircle } from "lucide-react"
import type { Transaction, OnrampTransaction, OfframpTransaction } from "@/types/exchange/transaction"
import { getOnrampTransactions, getOfframpTransactions } from "@/app/actions/exchange/transactions"

interface TransactionListProps {
  className?: string
}

type TabType = 'onramp' | 'offramp'

export function TransactionList({ className = "" }: TransactionListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('onramp')
  const [onrampTransactions, setOnrampTransactions] = useState<OnrampTransaction[]>([])
  const [offrampTransactions, setOfframpTransactions] = useState<OfframpTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Pagination state
  const [onrampPagination, setOnrampPagination] = useState({
    pageOffset: 0,
    hasMore: false,
    isLoadingMore: false
  })
  const [offrampPagination, setOfframpPagination] = useState({
    pageOffset: 0,
    hasMore: false,
    isLoadingMore: false
  })

  // Load transactions (initial load or refresh)
  const loadTransactions = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      // Reset pagination state for fresh load
      setOnrampPagination({ pageOffset: 0, hasMore: false, isLoadingMore: false })
      setOfframpPagination({ pageOffset: 0, hasMore: false, isLoadingMore: false })

      // Load both onramp and offramp transactions in parallel (first page)
      const [onrampResult, offrampResult] = await Promise.all([
        getOnrampTransactions({ pageOffset: 0, pageSize: 20 }),
        getOfframpTransactions({ pageOffset: 0, pageSize: 20 })
      ])

      if (onrampResult.success && onrampResult.transactions) {
        setOnrampTransactions(onrampResult.transactions)
        setOnrampPagination({
          pageOffset: 0,
          hasMore: onrampResult.pagination?.hasMore || false,
          isLoadingMore: false
        })
      } else if (!onrampResult.success) {
        console.warn('Failed to load onramp transactions:', onrampResult.message)
      }

      if (offrampResult.success && offrampResult.transactions) {
        setOfframpTransactions(offrampResult.transactions)
        setOfframpPagination({
          pageOffset: 0,
          hasMore: offrampResult.pagination?.hasMore || false,
          isLoadingMore: false
        })
      } else if (!offrampResult.success) {
        console.warn('Failed to load offramp transactions:', offrampResult.message)
      }

      // Show error only if both fail
      if (!onrampResult.success && !offrampResult.success) {
        setError('Failed to load transactions. Please try again.')
      }

    } catch (err) {
      console.error('Error loading transactions:', err)
      setError('An unexpected error occurred while loading transactions.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load transactions on mount
  useEffect(() => {
    loadTransactions()
  }, [])

  // Load more transactions for pagination
  const loadMoreTransactions = async () => {
    try {
      const isOnramp = activeTab === 'onramp'
      const currentPagination = isOnramp ? onrampPagination : offrampPagination
      
      if (!currentPagination.hasMore || currentPagination.isLoadingMore) {
        return
      }

      // Set loading state for current tab
      if (isOnramp) {
        setOnrampPagination(prev => ({ ...prev, isLoadingMore: true }))
      } else {
        setOfframpPagination(prev => ({ ...prev, isLoadingMore: true }))
      }

      const nextPageOffset = currentPagination.pageOffset + 20
      
      const result = isOnramp 
        ? await getOnrampTransactions({ pageOffset: nextPageOffset, pageSize: 20 })
        : await getOfframpTransactions({ pageOffset: nextPageOffset, pageSize: 20 })

      if (result.success && result.transactions) {
        if (isOnramp) {
          setOnrampTransactions(prev => [...prev, ...result.transactions as OnrampTransaction[]])
          setOnrampPagination({
            pageOffset: nextPageOffset,
            hasMore: result.pagination?.hasMore || false,
            isLoadingMore: false
          })
        } else {
          setOfframpTransactions(prev => [...prev, ...result.transactions as OfframpTransaction[]])
          setOfframpPagination({
            pageOffset: nextPageOffset,
            hasMore: result.pagination?.hasMore || false,
            isLoadingMore: false
          })
        }
      } else {
        // Reset loading state on error
        if (isOnramp) {
          setOnrampPagination(prev => ({ ...prev, isLoadingMore: false }))
        } else {
          setOfframpPagination(prev => ({ ...prev, isLoadingMore: false }))
        }
        console.warn(`Failed to load more ${activeTab} transactions:`, result.message)
      }

    } catch (err) {
      console.error('Error loading more transactions:', err)
      // Reset loading state on error
      if (activeTab === 'onramp') {
        setOnrampPagination(prev => ({ ...prev, isLoadingMore: false }))
      } else {
        setOfframpPagination(prev => ({ ...prev, isLoadingMore: false }))
      }
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    loadTransactions(true)
  }

  // Get active transactions based on current tab
  const getActiveTransactions = (): Transaction[] => {
    if (activeTab === 'onramp') {
      return onrampTransactions
    }
    return offrampTransactions
  }

  // Get active pagination state
  const getActivePagination = () => {
    return activeTab === 'onramp' ? onrampPagination : offrampPagination
  }

  // Tab styling
  const getTabClass = (tab: TabType) => {
    const baseClass = "px-4 py-2 text-sm font-bold border-2 border-black transition-all flex items-center gap-2"
    return activeTab === tab
      ? `${baseClass} bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`
      : `${baseClass} bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`
  }

  const activeTransactions = getActiveTransactions()

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner text="Loading transactions..." />
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-gray-600 mt-1">Your trading history</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('onramp')}
          className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'onramp'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <ArrowDownRight className="h-4 w-4" />
          Buy ({onrampTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('offramp')}
          className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'offramp'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          Sell ({offrampTransactions.length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 text-red-600 hover:text-red-800 p-0 h-auto font-medium underline"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        {activeTransactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'onramp' ? (
                <ArrowDownRight className="h-10 w-10 text-gray-400" />
              ) : (
                <ArrowUpRight className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">No {activeTab === 'onramp' ? 'Buy' : 'Sell'} Transactions</h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-sm mx-auto">
              You haven't made any {activeTab === 'onramp' ? 'purchase' : 'sale'} transactions yet. Start trading to see your history here.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              Start Trading
            </Button>
          </div>
        ) : (
          <>
            {activeTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.transactionId}
                transaction={transaction}
              />
            ))}
            
            {/* Load More Button */}
            {getActivePagination().hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  className="border border-gray-200 hover:bg-gray-50 rounded-xl px-6 py-2.5 font-medium"
                  onClick={loadMoreTransactions}
                  disabled={getActivePagination().isLoadingMore}
                >
                  {getActivePagination().isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size={16} text="" />
                      Loading...
                    </div>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}