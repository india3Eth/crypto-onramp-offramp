import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, AlertCircle, Clock, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitKycForReviewPublic } from "@/app/actions/kyc"

interface KycStatusProps {
  status: string | undefined
  level?: string | undefined
  className?: string
  onRefresh?: () => Promise<void>
}

export function KycStatus({ status, level, className = "", onRefresh }: KycStatusProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Handle submit for review
  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      
      const result = await submitKycForReviewPublic()
      
      if (result.success) {
        // Refresh user data to get updated status
        if (onRefresh) {
          await onRefresh()
        }
      } else {
        setSubmitError(result.message)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!status || status === 'NONE') {
    return (
      <div className={`flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200 ${className}`}>
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-2" />
          <span className="font-medium">Identity verification required</span>
        </div>
        <Button 
          size="sm" 
          onClick={() => router.push('/kyc')}
          className="ml-4 bg-blue-500"
        >
          Verify Now
        </Button>
      </div>
    )
  }

  // Special case for IN_REVIEW status - when data is collected but not yet submitted for review
  if (status === 'IN_REVIEW') {
    return (
      <div className={`flex flex-col p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="font-medium">Verification data ready for review</span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          onClick={handleSubmitForReview}
          disabled={isSubmitting}
          className="mt-2 bg-blue-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-1" />
              Submit for Review
            </>
          )}
        </Button>
        
        {submitError && (
          <div className="mt-2 p-2 bg-red-100 text-xs text-red-600">
            Error: {submitError}
          </div>
        )}
      </div>
    )
  }

  if (status === 'PENDING') {
    return (
      <div className={`flex items-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 ${className}`}>
        <Clock className="h-5 w-5 text-yellow-500 mr-2" />
        <span className="font-medium">Verification in progress</span>
      </div>
    )
  }

  if (status === 'COMPLETED') {
    // Use a default value of "Level 1" if level is undefined
    const currentLevel = level || "Level 1"
    
    return (
      <div className={`flex flex-col p-4 bg-green-50 rounded-lg border-2 border-green-200 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-medium">Identity verified - {currentLevel}</span>
          </div>
          <div className="px-2 py-1 bg-green-200 rounded text-xs font-bold">
            {currentLevel}
          </div>
        </div>
        
        {/* Show upgrade buttons based on current level */}
        {(currentLevel === "Level 1") && (
          <Button 
            size="sm" 
            onClick={() => router.push('/kyc/level2')}
            className="mt-2 bg-blue-500"
          >
            <Shield className="h-4 w-4 mr-1" />
            Upgrade to Level 2
          </Button>
        )}
        
        {currentLevel === "Level 2" && (
          <Button 
            size="sm" 
            onClick={() => router.push('/kyc/level3')}
            className="mt-2 bg-blue-500"
          >
            <Shield className="h-4 w-4 mr-1" />
            Upgrade to Level 3
          </Button>
        )}
        
        {currentLevel === "Level 3" && (
          <div className="text-sm text-green-700 mt-2">
            You have completed the highest verification level.
          </div>
        )}
      </div>
    )
  }

  if (status === 'UPDATE_REQUIRED' || status === 'FAILED') {
    return (
      <div className={`flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200 ${className}`}>
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="font-medium">Verification failed</span>
        </div>
        <Button 
          size="sm" 
          onClick={() => router.push('/kyc')}
          className="ml-4 bg-red-500"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return null
}