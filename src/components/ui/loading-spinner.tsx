import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: number
  className?: string
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  size = 24,
  className = "",
  text = "Loading...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2
        className="animate-spin text-blue-500 mb-2"
        size={size}
      />
      {text && <p className="text-gray-500">{text}</p>}
    </div>
  )
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
        {content}
      </div>
    )
  }
  
  return content
}