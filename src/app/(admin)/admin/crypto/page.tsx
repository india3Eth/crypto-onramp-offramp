"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoManagement } from "@/components/admin/crypto-management"
import { Coins } from "lucide-react"

export default function CryptoManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Coins className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold tracking-tight">Crypto Assets Management</h1>
      </div>
      
      <p className="text-gray-500 max-w-2xl">
        Enable or disable cryptocurrency assets for onramp (buying) and offramp (selling) operations.
        Changes are applied instantly to all users.
      </p>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle>Cryptocurrency Assets Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <CryptoManagement />
        </CardContent>
      </Card>
    </div>
  )
}