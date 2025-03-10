import { useRouter } from "next/navigation"
import { Shield, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KycStatusProps {
  status: string | undefined
  className?: string
}

export function KycStatus({ status, className = "" }: KycStatusProps) {
  const router = useRouter()

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
    return (
      <div className={`flex items-center p-4 bg-green-50 rounded-lg border-2 border-green-200 ${className}`}>
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <span className="font-medium">Identity verified</span>
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