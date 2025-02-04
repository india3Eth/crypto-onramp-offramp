"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ExchangeToggleProps {
  mode: "onramp" | "offramp"
  onChange: (mode: "onramp" | "offramp") => void
}

export function ExchangeToggle({ mode, onChange }: ExchangeToggleProps) {
  return (
    <div className="inline-flex p-1 bg-muted border-brutal border-black shadow-brutal-sm">
      <Button
        variant="ghost"
        className={cn(
          "flex-1 px-6 py-2 text-sm font-medium transition-colors",
          mode === "onramp" && "bg-white shadow-brutal-sm border-brutal border-black",
        )}
        onClick={() => onChange("onramp")}
      >
        Buy
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "flex-1 px-6 py-2 text-sm font-medium transition-colors",
          mode === "offramp" && "bg-white shadow-brutal-sm border-brutal border-black",
        )}
        onClick={() => onChange("offramp")}
      >
        Sell
      </Button>
    </div>
  )
}

