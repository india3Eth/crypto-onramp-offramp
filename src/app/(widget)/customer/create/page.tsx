"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/use-auth"
import { CreateCustomerForm } from "@/components/customer/create-customer-form"
import { AuthSkeleton } from "@/components/ui/auth-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User } from "lucide-react"
import { useEffect } from "react"

export default function CreateCustomerPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  // Redirect if already has a customerId
  useEffect(() => {
    if (user?.customerId) {
      router.push('/profile')
    }
  }, [user, router])
  
  // If still loading, show skeleton
  if (loading) {
    return <AuthSkeleton variant="generic" />
  }
  
  // If not logged in, show login prompt
  if (!user) {
    return (
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center border-2 border-black">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Sign in to continue</h1>
          <p className="text-center text-gray-600">
            You need to be logged in to create a customer profile.
          </p>
          <Button 
            onClick={() => router.push('/login?redirect=/customer/create')}
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            Sign in to continue
          </Button>
        </div>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      
      <CreateCustomerForm />
    </div>
  )
}