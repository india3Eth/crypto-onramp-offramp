"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { submitKycLevel1 } from "@/app/actions/kyc"
import { useAuth } from "@/hooks/auth/use-auth"
import { useRouter } from "next/navigation"

export default function KYCPage() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    countryOfResidence: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error" | "pending">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // List of countries for dropdowns
  const countries = [
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "ES", label: "Spain" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "JP", label: "Japan" },
    { value: "CY", label: "Cyprus" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage("")
    
    // Validate form data
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || 
        !formData.nationality || !formData.countryOfResidence) {
      setErrorMessage("All fields are required")
      setSubmitStatus("error")
      setSubmitting(false)
      return
    }
    
    try {
      // Submit KYC data using server action
      const result = await submitKycLevel1(formData)
      
      if (result.success) {
        // First set to pending state while submission for review is processing
        setSubmitStatus("pending")
        
        // Use status from the result (which comes from the automatic refresh)
        if (result.status === 'PENDING') {
          // If already in PENDING status, show success
          setSubmitStatus("success")
        } else {
          // Otherwise, refresh the user data to get the latest status
          await refreshUser()
          setSubmitStatus("success")
        }
      } else {
        setErrorMessage(result.message)
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Error submitting KYC:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
      setSubmitStatus("error")
    } finally {
      setSubmitting(false)
    }
  }

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/login?redirect=/kyc')
    return null
  }
  
  // Redirect if no customerId
  if (!loading && user && !user.customerId) {
    router.push('/customer/create?redirect=/kyc')
    return null
  }

  // Show pending state
  if (submitStatus === "pending") {
    return (
      <div className="space-y-6">
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-yellow-200 p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-black">
              <Loader2 className="h-10 w-10 text-yellow-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">Verification Being Processed...</h1>
            <p className="font-medium">
              Your identity verification has been submitted and is now being processed.
              This may take a moment. Please wait...
            </p>
            <div className="w-full mt-4 bg-yellow-300 rounded-full h-2.5">
              <div className="bg-yellow-600 h-2.5 rounded-full w-1/2 animate-pulse"></div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Show success state
  if (submitStatus === "success") {
    return (
      <div className="space-y-6">
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-green-200 p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-black">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Verification Submitted!</h1>
            <p className="font-medium">
              Your identity verification request has been submitted successfully and sent for review. 
              We will process your information and update you shortly.
            </p>
            <Button 
              className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
              onClick={() => router.push("/profile")}
            >
              Return to Profile
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center border-2 border-black mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Verify your identity</h1>
          <p className="text-center mb-6">Complete KYC to start trading</p>
          
          {submitStatus === "error" && (
            <div className="w-full mb-6 p-4 bg-red-200 border-2 border-black rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                {errorMessage || "We encountered an error while submitting your verification. Please try again."}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-bold">First name</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-bold">Last name</label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="font-bold">Date of birth</label>
              <Input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-bold">Nationality</label>
              <Select
                value={formData.nationality}
                onValueChange={(value) => handleSelectChange('nationality', value)}
              >
                <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <SelectValue placeholder="Select your nationality" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="font-bold">Country of residence</label>
              <Select
                value={formData.countryOfResidence}
                onValueChange={(value) => handleSelectChange('countryOfResidence', value)}
              >
                <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <SelectValue placeholder="Select your country of residence" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit"
              className="w-full mt-4 bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Submitting...
                </div>
              ) : "Submit verification"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}