import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import type { Fee } from "@/types/exchange"

interface FeeDisplayProps {
  fees: Fee[]
  mode: "buy" | "sell"
  className?: string
}

export function FeeDisplay({ fees, mode, className }: FeeDisplayProps) {
  if (!fees || fees.length === 0) {
    return null
  }
  
  // Filter out markup fees
  const relevantFees = fees.filter(fee => fee.type !== "markupFee")
  
  // Calculate total fees (excluding markup fees)
  const totalFee = relevantFees.reduce((sum, fee) => {
    return sum + parseFloat(fee.amount)
  }, 0)
  
  // Get the currency from the first fee (they should all be the same currency)
  const feeCurrency = fees[0].currency
  
  // Format the fee amount with 2 decimal places
  const formatFee = (amount: string | number) => {
    return parseFloat(amount.toString()).toFixed(2)
  }
  
  // Determine if we have specific fee types
  const hasNetworkFee = fees.some(fee => fee.type === "networkFee")
  const hasProcessingFee = fees.some(fee => fee.type === "processingFee")

  return (
    <div className={`text-sm flex items-center ${className}`}>
      <span className="mr-1">{formatFee(totalFee)} {feeCurrency} in fees</span>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Fee Breakdown</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              {relevantFees.map((fee, index) => {
                // Format fee type label
                let label = ""
                switch (fee.type) {
                  case "processingFee":
                    label = "Processing Fee"
                    break
                  case "networkFee":
                    label = "Network Fee"
                    break
                  default:
                    label = fee.type.charAt(0).toUpperCase() + 
                            fee.type.slice(1).replace(/([A-Z])/g, ' $1')
                }
                
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">{formatFee(fee.amount)} {fee.currency}</span>
                  </div>
                )
              })}
              
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                <span className="font-semibold">Total Fees</span>
                <span className="font-semibold">{formatFee(totalFee)} {feeCurrency}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              {mode === "buy" ? (
                <p>
                  When buying crypto, you pay {hasProcessingFee ? "processing" : ""} 
                  {hasProcessingFee && hasNetworkFee ? " and " : ""}
                  {hasNetworkFee ? "network" : ""} fees, 
                  which are included in the total amount displayed.
                </p>
              ) : (
                <p>When selling crypto, {hasProcessingFee ? "processing" : ""} fees are deducted from the amount you receive.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}