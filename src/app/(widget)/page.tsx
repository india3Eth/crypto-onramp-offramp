"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"

// Custom hooks
import { useCryptoOptions } from "@/hooks/exchange/use-crypto-options"
import { usePaymentMethods } from "@/hooks/exchange/use-payment-methods"
import { useFormDataManager } from "@/hooks/exchange/use-form-data-manager"
import { useQuoteManager } from "@/hooks/exchange/use-quote-manager"

// Components
import { OptionsLoader } from "@/components/exchange/options-loader"
import { QuoteContainer } from "@/components/exchange/quote-container"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

export default function HomePage() {
  const router = useRouter()
  // Start with basic state for mode since we need it for API calls
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  
  // Use custom hooks for API data with current mode
  const { cryptoOptions, isLoading: isLoadingCrypto, error: cryptoError } = useCryptoOptions(mode)
  const { paymentMethods, fiatOptions, isLoading: isLoadingPayments, error: paymentsError } = usePaymentMethods(mode)
  
  // Use form data manager with actual API data
  const {
    formData,
    lastModifiedField,
    setFormData,
    setLastModifiedField,
    handleSwapCurrencies: formSwapCurrencies
  } = useFormDataManager({
    fiatOptions,
    cryptoOptions,
    isLoadingOptions: isLoadingCrypto || isLoadingPayments,
    mode
  })
  
  // Handle mode changes by updating both local mode and form data
  const handleSwapCurrencies = () => {
    setMode(prev => prev === "buy" ? "sell" : "buy")
    formSwapCurrencies()
  }
  
  const isLoadingOptions = isLoadingCrypto || isLoadingPayments,
        optionsError = cryptoError || paymentsError
  
  // Use quote manager for quote-related logic
  const {
    quote,
    isLoadingQuote,
    quoteError,
    apiErrorDetails,
    lastQuoteTimestamp,
    hasInitialQuote,
    fetchQuote,
    handleContinue
  } = useQuoteManager({
    formData,
    lastModifiedField,
    isLoadingOptions,
    setFormData
  })

  const handleContinueWithRouter = (mode: "buy" | "sell") => {
    handleContinue(mode, (url: string) => router.push(url))
  }

  return (
    <OptionsLoader 
      isLoading={isLoadingOptions} 
      isLoadingQuote={isLoadingQuote}
      hasInitialQuote={hasInitialQuote}
      error={optionsError}
      onRetry={() => window.location.reload()}
    >
      <QuoteContainer
        mode={mode}
        formData={formData}
        fiatOptions={fiatOptions}
        cryptoOptions={cryptoOptions}
        paymentMethods={paymentMethods}
        quote={quote}
        isLoadingQuote={isLoadingQuote}
        quoteError={quoteError}
        apiErrorDetails={apiErrorDetails}
        lastQuoteTimestamp={lastQuoteTimestamp}
        onFormDataChange={setFormData}
        onModeToggle={handleSwapCurrencies}
        onLastModifiedFieldChange={setLastModifiedField}
        onCreateQuote={fetchQuote}
        onContinue={handleContinueWithRouter}
      />
    </OptionsLoader>
  )
}