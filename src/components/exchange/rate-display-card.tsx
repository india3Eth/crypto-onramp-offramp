"use client"

import { Clock, RefreshCw } from "lucide-react"
import { FeeDisplay } from "@/components/exchange/fee-display"

interface RateDisplayCardProps {
  mode: "buy" | "sell"
  quote: { rate?: string; fees?: Array<{ type: string; amount: string; currency: string }> } | null
  fromCurrency: string
  toCurrency: string
  countdown: number
  isRefreshing: boolean
  onRefresh: (e: React.MouseEvent) => void
}

export function RateDisplayCard({
  mode,
  quote,
  fromCurrency,
  toCurrency,
  countdown,
  isRefreshing,
  onRefresh
}: RateDisplayCardProps) {
  if (!quote) return null

  const formatExchangeRate = () => {
    if (!quote.rate) return null;
    
    const rate = parseFloat(quote.rate);
    
    if (mode === "buy") {
      return (
        <div className="font-medium text-sm">
          1 {toCurrency} = <span className="text-blue-800 font-bold">{rate.toFixed(3)}</span> {fromCurrency}
        </div>
      );
    } else {
      return (
        <div className="font-medium text-sm">
          1 {fromCurrency} = <span className="text-blue-800 font-bold">{rate.toFixed(3)}</span> {toCurrency}
        </div>
      );
    }
  }

  return (
    <div className="rounded-xl bg-blue-50 border border-blue-200 shadow-sm p-4">
      <div className="flex items-center justify-between">
        {formatExchangeRate()}
        
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full px-3 py-1.5 shadow-md border-2 border-white flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{countdown}s</span>
          </div>
          
          <button 
            onClick={onRefresh}
            className={`bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md border-2 border-white flex items-center justify-center ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}
            disabled={isRefreshing}
            aria-label="Refresh rate"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {quote.fees && quote.fees.length > 0 && (
        <div className="mt-2 pt-2 border-t border-blue-200">
          <FeeDisplay fees={quote.fees} mode={mode} />
        </div>
      )}
    </div>
  )
}