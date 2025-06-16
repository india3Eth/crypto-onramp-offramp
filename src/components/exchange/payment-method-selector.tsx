"use client"

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Wallet } from "lucide-react"

interface PaymentMethodSelectorProps {
  mode: "buy" | "sell"
  value: string
  onChange: (value: string) => void
  paymentMethods: Array<{ id: string; onRampSupported?: boolean; offRampSupported?: boolean }>
  hasNoMethods?: boolean
  noMethodsMessage?: string
}

export function PaymentMethodSelector({
  mode,
  value,
  onChange,
  paymentMethods,
  hasNoMethods = false,
  noMethodsMessage
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="font-bold">{mode === "buy" ? "Payment Method" : "Payout Method"}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>{value}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          {paymentMethods.length > 0 ? (
            paymentMethods.map(method => (
              <SelectItem key={method.id} value={method.id}>
                {method.id.replace(/_/g, ' ')}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>
              No payment methods available for this currency
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {hasNoMethods && noMethodsMessage && (
        <p className="text-xs text-red-500 mt-1">
          {noMethodsMessage}
        </p>
      )}
    </div>
  )
}