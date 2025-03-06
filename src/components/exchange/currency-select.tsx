// src/components/exchange/currency-select.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CurrencySelectProps {
  label: string
  amount: string
  currency: string
  options: string[] | { id: string, [key: string]: any }[]
  onAmountChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function CurrencySelect({
  label,
  amount,
  currency,
  options,
  onAmountChange,
  onCurrencyChange,
  disabled = false,
  placeholder = "0.00"
}: CurrencySelectProps) {
  return (
    <div className="space-y-2">
      <label className="font-bold">{label}</label>
      <div className="flex gap-2">
        <Input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="flex-grow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
          placeholder={placeholder}
          disabled={disabled}
        />
        <Select
          value={currency}
          onValueChange={onCurrencyChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[100px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
            {options.map(option => {
              const value = typeof option === 'string' ? option : option.id;
              const label = typeof option === 'string' ? option : option.id;
              
              return (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}