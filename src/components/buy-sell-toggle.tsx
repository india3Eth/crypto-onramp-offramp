import { Button } from "@/components/ui/button"

interface BuySellToggleProps {
  mode: "buy" | "sell"
  onChange: (mode: "buy" | "sell") => void
}

export function BuySellToggle({ mode, onChange }: BuySellToggleProps) {
  return (
    <div className="flex space-x-2 bg-secondary p-1 rounded-md">
      <Button
        variant={mode === "buy" ? "default" : "ghost"}
        onClick={() => onChange("buy")}
        className={`flex-1 ${mode === "buy" ? "bg-brutalism-yellow text-background" : "text-text"}`}
      >
        Buy
      </Button>
      <Button
        variant={mode === "sell" ? "default" : "ghost"}
        onClick={() => onChange("sell")}
        className={`flex-1 ${mode === "sell" ? "bg-brutalism-yellow text-background" : "text-text"}`}
      >
        Sell
      </Button>
    </div>
  )
}

