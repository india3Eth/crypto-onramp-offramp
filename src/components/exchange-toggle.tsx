"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExchangeToggleProps {
  mode: "onramp" | "offramp"
  onChange: (mode: "onramp" | "offramp") => void
  className?: string
}

export function ExchangeToggle({ mode, onChange, className }: ExchangeToggleProps) {
  return (
    <div className={cn("inline-flex p-1 bg-gray-100 rounded-md", className)}>
      <Button
        variant="ghost"
        className={cn(
          "flex-1 px-6 py-2 text-sm font-medium transition-colors rounded-sm",
          mode === "onramp" && "bg-white shadow-sm border border-gray-200",
          mode !== "onramp" && "text-gray-600"
        )}
        onClick={() => onChange("onramp")}
      >
        Buy
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "flex-1 px-6 py-2 text-sm font-medium transition-colors rounded-sm",
          mode === "offramp" && "bg-white shadow-sm border border-gray-200",
          mode !== "offramp" && "text-gray-600"
        )}
        onClick={() => onChange("offramp")}
      >
        Sell
      </Button>
    </div>
  )
}