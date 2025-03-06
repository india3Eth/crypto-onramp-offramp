"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Download, RefreshCw } from "lucide-react"
import { fetchAndStoreConfigs } from "@/app/actions/config"

interface ConfigRefresherProps {
  className?: string
}

export function ConfigRefresher({ className }: ConfigRefresherProps) {
  const [isPending, startTransition] = useTransition()
  const [refreshResult, setRefreshResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Handler for refreshing config data
  const handleRefreshConfig = async () => {
    setRefreshResult(null)
    
    startTransition(async () => {
      try {
        const result = await fetchAndStoreConfigs()
        setRefreshResult(result)
      } catch (error) {
        setRefreshResult({
          success: false,
          message: error instanceof Error ? error.message : "Failed to refresh configuration"
        })
      }
    })
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        onClick={handleRefreshConfig}
        disabled={isPending}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 transition-transform active:translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
      >
        {isPending ? (
          <span className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Updating Configs...
          </span>
        ) : (
          <span className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Update Configurations
          </span>
        )}
      </Button>
      
      {/* Config update result message */}
      {refreshResult && (
        <div className={`p-3 border-2 rounded-md ${
          refreshResult.success 
            ? "bg-green-100 text-green-600 border-green-600" 
            : "bg-red-100 text-red-600 border-red-600"
        }`}>
          <div className="flex">
            {!refreshResult.success && (
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
            )}
            <p className="text-sm">{refreshResult.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}