"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, AlertCircle, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
  }

  // Handle email submission
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setError(null)
    
    // Validate email
    if (!email) {
      setError("Email is required")
      return
    }
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call to request OTP
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo: we'll always succeed in requesting an OTP
      setOtpSent(true)
      
      // Move to OTP verification step after 1 second
      setTimeout(() => {
        setStep("otp")
        setIsSubmitting(false)
      }, 1000)
      
    } catch (error) {
      setError("Failed to send OTP. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setError(null)
    
    // Validate OTP
    if (!otp) {
      setError("Please enter the verification code")
      return
    }
    
    if (otp.length !== 6) {
      setError("Verification code must be 6 digits")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo: any 6-digit code works
      router.push("/exchange")
      
    } catch (error) {
      setError("Invalid verification code. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Email input step
  const renderEmailStep = () => (
    <div>
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center border-2 border-black mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">Log in to your account</h1>
        <p className="text-center text-gray-600 mt-1">We'll send you a code to verify your email</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}
      
      {otpSent && (
        <div className="mb-6 p-4 bg-green-100 border-2 border-green-600 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-600">Verification code sent to your email!</p>
        </div>
      )}
      
      <form onSubmit={handleRequestOTP} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="font-bold">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
            disabled={isSubmitting || otpSent}
          />
        </div>
        
        <Button 
          type="submit"
          className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          disabled={isSubmitting || otpSent}
        >
          {isSubmitting ? "Sending..." : otpSent ? "Code sent!" : "Send verification code"}
        </Button>
      </form>
    </div>
  )

  // OTP verification step
  const renderOTPStep = () => (
    <div>
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center border-2 border-black mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-center text-gray-600 mt-1">
          We sent a verification code to <span className="font-semibold">{email}</span>
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="otp" className="font-bold">
            Verification code
          </label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Enter 6-digit code"
            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] text-center text-lg tracking-widest"
          />
          <p className="text-sm text-gray-500">The code will expire in 10 minutes</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            type="submit"
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify and continue"} 
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            type="button"
            variant="ghost"
            className="w-full text-black hover:bg-gray-100"
            onClick={() => {
              setStep("email")
              setOtp("")
              setError(null)
              setOtpSent(false)
            }}
          >
            Change email
          </Button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-6">
        {step === "email" ? renderEmailStep() : renderOTPStep()}
      </Card>
      
      {/* Demo helper - remove this in production */}
      <div className="text-center text-xs text-gray-500">
        <p>For demo: Enter any valid email, then use any 6-digit code</p>
      </div>
    </div>
  )
}