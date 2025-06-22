"use client"

import type { QuoteRequest } from "@/types/exchange"
import { useCountdownTimer } from "@/hooks/common/use-countdown-timer"
import { QUOTE_REFRESH_COUNTDOWN_SECONDS } from "@/utils/common/constants"
import { usePaymentMethodFilter } from "@/hooks/exchange/use-payment-method-filter"
import { useQuoteRefresh } from "@/hooks/exchange/use-quote-refresh"
import { CurrencySelect } from "@/components/exchange/currency-select"
import { QuoteFormHeader } from "@/components/exchange/quote-form-header"
import { RateDisplayCard } from "@/components/exchange/rate-display-card"
import { PaymentMethodSelector } from "@/components/exchange/payment-method-selector"

interface QuoteFormProps {
  mode: "buy" | "sell"
  formData: QuoteRequest
  onFormDataChange: (newFormData: QuoteRequest) => void
  onModeToggle: () => void
  fiatOptions: string[]
  cryptoOptions: Array<{ id: string; network?: string }>
  paymentMethods: Array<{ id: string; onRampSupported?: boolean; offRampSupported?: boolean; onramp?: string[]; offramp?: string[] }>
  onCreateQuote: () => void
  quote: { rate?: string; fees?: Array<{ type: string; amount: string; currency: string }> } | null
  isLoadingQuote: boolean
  onLastModifiedFieldChange: (field: "fromAmount" | "toAmount") => void
  lastQuoteTimestamp?: number
}

export function QuoteForm({
  mode,
  formData,
  onFormDataChange,
  onModeToggle,
  fiatOptions,
  cryptoOptions,
  paymentMethods,
  onCreateQuote,
  quote,
  isLoadingQuote,
  onLastModifiedFieldChange,
  lastQuoteTimestamp
}: QuoteFormProps) {
  // Use custom hooks for state management
  const countdown = useCountdownTimer(
    QUOTE_REFRESH_COUNTDOWN_SECONDS,
    onCreateQuote, // Callback when timer reaches zero
    [quote] // Dependencies that reset the timer when changed
  )
  
  const { filteredPaymentMethods, hasNoMethods, noMethodsMessage } = usePaymentMethodFilter({
    mode,
    formData,
    paymentMethods,
    onFormDataChange
  })
  
  const { handleManualRefresh } = useQuoteRefresh({
    quote,
    lastQuoteTimestamp,
    onCreateQuote,
    isLoadingQuote
  })
  
  // Handle fromAmount input change
  const handleFromAmountChange = (value: string) => {
    onLastModifiedFieldChange("fromAmount")
    onFormDataChange({
      ...formData,
      fromAmount: value
    })
  }
  
  // Handle toAmount input change
  const handleToAmountChange = (value: string) => {
    onLastModifiedFieldChange("toAmount")
    onFormDataChange({
      ...formData,
      toAmount: value
    })
  }

  // Handle fromCurrency selection change
  const handleFromCurrencyChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fromCurrency: value
    })
  }

  // Handle toCurrency selection change
  const handleToCurrencyChange = (value: string) => {
    onFormDataChange({
      ...formData,
      toCurrency: value
    })
  }

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    onFormDataChange({
      ...formData,
      paymentMethodType: value
    })
  }

  return (
    <div className="space-y-4">
      <QuoteFormHeader mode={mode} onModeToggle={onModeToggle} />

      {/* From currency (You Pay/Send) */}
      <CurrencySelect
        label={mode === "buy" ? "You Pay" : "You Send"}
        amount={formData.fromAmount}
        currency={formData.fromCurrency}
        options={mode === "buy" ? fiatOptions : cryptoOptions}
        onAmountChange={handleFromAmountChange}
        onCurrencyChange={handleFromCurrencyChange}
      />

      <RateDisplayCard
        mode={mode}
        quote={quote}
        fromCurrency={formData.fromCurrency}
        toCurrency={formData.toCurrency}
        countdown={countdown}
        isRefreshing={isLoadingQuote}
        onRefresh={handleManualRefresh}
      />

      {/* To currency (You Get/Receive) */}
      <CurrencySelect
        label={mode === "buy" ? "You Get" : "You Receive"}
        amount={formData.toAmount}
        currency={formData.toCurrency}
        options={mode === "buy" ? cryptoOptions : fiatOptions}
        onAmountChange={handleToAmountChange}
        onCurrencyChange={handleToCurrencyChange}
      />

      <PaymentMethodSelector
        mode={mode}
        value={formData.paymentMethodType}
        onChange={handlePaymentMethodChange}
        paymentMethods={filteredPaymentMethods}
        hasNoMethods={hasNoMethods}
        noMethodsMessage={noMethodsMessage}
      />
    </div>
  )
}