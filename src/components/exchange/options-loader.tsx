"use client"

import { ErrorDisplay } from "@/components/ui/error-display"

interface OptionsLoaderProps {
  isLoading: boolean
  error: string | null
  onRetry?: () => void
  children?: React.ReactNode
}

export function OptionsLoader({ 
  isLoading, 
  error, 
  onRetry = () => window.location.reload(),
  children 
}: OptionsLoaderProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin text-blue-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="text-gray-500">Loading exchange options...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={onRetry} />
  }

  return <>{children}</>
}