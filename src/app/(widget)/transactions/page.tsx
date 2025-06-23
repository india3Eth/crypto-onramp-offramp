"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TransactionList } from "@/components/transactions/transaction-list"
import { useAuth } from "@/hooks/auth/use-auth"
import { AuthSkeleton } from "@/components/ui/auth-skeleton"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, ArrowLeft } from "lucide-react"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

export default function TransactionsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Show skeleton during initial load
  if (loading) {
    return <AuthSkeleton variant="generic" text="Loading transactions..." />
  }

  // If not logged in, show login prompt
  if (!user) {
    return (
      <Card className={`${CARD_BRUTALIST_STYLE} p-6`}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center border-2 border-black">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Sign in to view transactions</h1>
          <p className="text-center text-gray-600">
            You need to be logged in to view your transaction history.
          </p>
          <Button 
            onClick={() => router.push('/login?redirect=/transactions')}
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            Sign in
          </Button>
        </div>
      </Card>
    )
  }

  // Check if user has a customerId
  if (!user.customerId) {
    return (
      <Card className={`${CARD_BRUTALIST_STYLE} p-6`}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center border-2 border-black">
            <User className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Complete your profile</h1>
          <p className="text-center text-gray-600">
            You need to create a customer profile before viewing transactions.
          </p>
          <Button 
            onClick={() => router.push('/customer/create?redirect=/transactions')}
            className="w-full bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            Create Profile
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="px-4 pb-6 max-w-md mx-auto fade-in">
      <TransactionList />
    </div>
  )
}