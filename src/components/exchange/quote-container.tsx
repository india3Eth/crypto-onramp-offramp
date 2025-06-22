"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { QuoteForm } from "@/components/exchange/quote-form"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"
import type { QuoteRequest } from "@/types/exchange"

interface QuoteContainerProps {
  mode: "buy" | "sell"
  formData: QuoteRequest
  fiatOptions: string[]
  cryptoOptions: Array<{ id: string; network?: string }>
  paymentMethods: Array<{ id: string; onRampSupported?: boolean; offRampSupported?: boolean; onramp?: string[]; offramp?: string[] }>
  quote: { rate?: string; fees?: Array<{ type: string; amount: string; currency: string }> } | null
  isLoadingQuote: boolean
  quoteError: string | null
  apiErrorDetails: string | null
  lastQuoteTimestamp: number
  onFormDataChange: (data: QuoteRequest | ((prev: QuoteRequest) => QuoteRequest)) => void
  onModeToggle: () => void
  onLastModifiedFieldChange: (field: "fromAmount" | "toAmount") => void
  onCreateQuote: () => void
  onContinue: (mode: "buy" | "sell") => void
}

export function QuoteContainer({
  mode,
  formData,
  fiatOptions,
  cryptoOptions,
  paymentMethods,
  quote,
  isLoadingQuote,
  quoteError,
  apiErrorDetails,
  lastQuoteTimestamp,
  onFormDataChange,
  onModeToggle,
  onLastModifiedFieldChange,
  onCreateQuote,
  onContinue
}: QuoteContainerProps) {
  return (
    <Card className={`${CARD_BRUTALIST_STYLE} p-3`}>
      <div className="space-y-4">
        <QuoteForm
          mode={mode}
          formData={formData}
          onFormDataChange={onFormDataChange}
          onModeToggle={onModeToggle}
          fiatOptions={fiatOptions}
          cryptoOptions={cryptoOptions}
          paymentMethods={paymentMethods}
          onCreateQuote={onCreateQuote}
          quote={quote}
          isLoadingQuote={isLoadingQuote}
          onLastModifiedFieldChange={onLastModifiedFieldChange}
          lastQuoteTimestamp={lastQuoteTimestamp}
        />

        {/* Error display with API details */}
        {quoteError && (
          <div className="p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p>{quoteError}</p>
                
                {apiErrorDetails && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-300 rounded text-sm">
                    <p className="font-medium">API Error Details:</p>
                    <p className="mt-1">{apiErrorDetails}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Continue button */}
        <Button
          className={`w-full text-white font-bold py-3 transition-transform active:translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] ${mode === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
          disabled={!quote || isLoadingQuote}
          onClick={() => onContinue(mode)}
        >
          {isLoadingQuote ? "Getting quote..." : "Continue"}
        </Button>
      </div>
    </Card>
  )
}