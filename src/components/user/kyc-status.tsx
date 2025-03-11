import { useRouter } from "next/navigation"
import { Shield, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KycStatusProps {
  status: string | undefined
  level?: string | undefined
  className?: string
}

export function KycStatus({ status, level, className = "" }: KycStatusProps) {
  const router = useRouter()

  // For debugging
  console.log("KYC Status Component:", { status, level })

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