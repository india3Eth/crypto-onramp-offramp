import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorDisplayProps {
  message: string | null
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ message, onRetry, className = '' }: ErrorDisplayProps) {
  if (!message) return null
  
  return (
    <div className={`p-3 bg-red-100 text-red-600 border-2 border-red-600 rounded-md ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <p>{message}</p>
      </div>
      
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
  )
}