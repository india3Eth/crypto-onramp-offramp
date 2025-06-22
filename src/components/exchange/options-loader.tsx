"use client"

import { ErrorDisplay } from "@/components/ui/error-display"
import { WidgetSkeleton } from "@/components/ui/widget-skeleton"

interface OptionsLoaderProps {
  isLoading: boolean
  isLoadingQuote?: boolean
  hasInitialQuote?: boolean
  error: string | null
  onRetry?: () => void
  children?: React.ReactNode
}

export function OptionsLoader({ 
  isLoading, 
  isLoadingQuote = false,
  hasInitialQuote = false,
  error, 
  onRetry = () => window.location.reload(),
  children 
}: OptionsLoaderProps) {
  // Show skeleton while loading options OR while waiting for initial quote
  const shouldShowSkeleton = isLoading || (isLoadingQuote && !hasInitialQuote)
  
  if (shouldShowSkeleton) {
    return <WidgetSkeleton />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={onRetry} />
  }

  return <div className="fade-in">{children}</div>
}