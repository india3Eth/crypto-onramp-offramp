"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethodsManagement } from "@/components/admin/payment-methods-management"
import { CreditCard } from "lucide-react"

export default function PaymentMethodsManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold tracking-tight">Payment Methods Management</h1>
      </div>
      
      <p className="text-gray-500 max-w-2xl">
        Enable or disable payment methods for onramp (buying) and offramp (selling) operations.
        View supported countries and currencies for each payment method.
      </p>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle>Payment Methods Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodsManagement />
        </CardContent>
      </Card>
    </div>
  )
}