"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

interface QuoteFormHeaderProps {
  mode: "buy" | "sell"
  onModeToggle: () => void
}

export function QuoteFormHeader({ mode, onModeToggle }: QuoteFormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold">{mode === "buy" ? "Buy Crypto" : "Sell Crypto"}</h2>
      
      <Button 
        onClick={onModeToggle}
        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] p-2 rounded-md"
        size="sm"
      >
        <ArrowUpDown className="h-4 w-4 mr-1" />
        Switch to {mode === "buy" ? "Sell" : "Buy"}
      </Button>
    </div>
  )
}