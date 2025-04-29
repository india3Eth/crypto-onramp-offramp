import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorDisplayProps {
  message: string | null
  apiErrorDetails?: string | null
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ message, apiErrorDetails, onRetry, className = '' }: ErrorDisplayProps) {
  if (!message) return null
  
  return (
    <div className={`p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p>{message}</p>
          
          {/* Display detailed API error if available */}
          {apiErrorDetails && (
            <div className="mt-2 p-2 bg-red-50 border border-red-300 rounded text-sm">
              <p className="font-medium">API Error Details:</p>
              <p className="mt-1">{apiErrorDetails}</p>
            </div>
          )}
          
          {onRetry && (
            <Button 
              variant="outline" 
              className="w-full mt-2 border-red-600 text-red-600 hover:bg-red-50"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}