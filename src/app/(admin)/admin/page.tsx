"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CryptoManagement } from "@/components/admin/crypto-management"
import { PaymentMethodsManagement } from "@/components/admin/payment-methods-management"
import { RefreshCw, AlertCircle, ArrowUpRight, Wallet, CreditCard, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchAndStoreConfigs } from "@/app/actions/config/config"

// Stats card component
interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down"
}

function StatsCard({ title, value, change, icon: Icon, trend = "up" }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs mt-1 ${
          trend === "up" ? "text-green-500" : "text-red-500"
        }`}>
          <span>{change}</span>
          <ArrowUpRight className={`h-3 w-3 ml-1 ${
            trend === "down" && "transform rotate-90"
          }`} />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Handler for refreshing config data
  const handleRefreshConfig = async () => {
    setIsRefreshing(true)
    setRefreshResult(null)
    
    try {
      const result = await fetchAndStoreConfigs()
      setRefreshResult(result)
    } catch (error) {
      setRefreshResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to refresh configuration"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        
        <Button
          onClick={handleRefreshConfig}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Config"}
        </Button>
      </div>

      {refreshResult && (
        <div className={`p-4 rounded-md ${
          refreshResult.success 
            ? "bg-green-50 border border-green-200 text-green-700" 
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          <div className="flex">
            {!refreshResult.success && (
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
            )}
            <p>{refreshResult.message}</p>
          </div>
        </div>
      )}
      
      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Crypto Assets"
          value="24"
          change="+2 this week"
          icon={Wallet}
          trend="up"
        />
        <StatsCard
          title="Active Payment Methods"
          value="8"
          change="+1 this week"
          icon={CreditCard}
          trend="up"
        />
        <StatsCard
          title="Total Users"
          value="1,234"
          change="+21% this month"
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Transaction Volume"
          value="$28,419"
          change="-4% this week"
          icon={ArrowUpRight}
          trend="down"
        />
      </div>

      {/* Main content */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Exchange Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="crypto" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="crypto">Crypto Assets</TabsTrigger>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="crypto" className="mt-0">
              <CryptoManagement />
            </TabsContent>
            
            <TabsContent value="payment-methods" className="mt-0">
              <PaymentMethodsManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}