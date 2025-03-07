"use client"

import { useState } from "react"
import { createCustomer } from "@/app/actions/customer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, User } from "lucide-react"

export function CreateCustomerForm() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    customerId?: string;
  } | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setResult(null)
    
    try {
      const result = await createCustomer(phoneNumber)
      if (result.success) {
        // Show brief success message first
        setResult({
          success: true,
          message: "Customer created successfully"
        })
        
        // Then redirect to profile page after a short delay
        setTimeout(() => {
          window.location.href = '/profile'
        }, 1500)
        return
      }

      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white">
      <CardHeader>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center border-2 border-black mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Customer Profile</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            We need your phone number to create your customer profile
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Display success or error message */}
        {result && (
          <div className={`p-4 mb-4 rounded-md flex items-start ${
            result.success 
              ? "bg-green-100 border-2 border-green-600 text-green-700"
              : "bg-red-100 border-2 border-red-600 text-red-700"
          }`}>
            {result.success ? (
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{result.message}</p>
              {result.success && result.customerId && (
                <p className="text-sm mt-1">Customer ID: {result.customerId}</p>
              )}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="font-bold">Phone Number</label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
              required
            />
            <p className="text-sm text-gray-500">
              Please enter your phone number with country code (e.g., +1234567890)
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || !phoneNumber || (result?.success ?? false)}
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Customer Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}