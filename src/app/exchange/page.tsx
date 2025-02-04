"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, Wallet } from "lucide-react"
import { ExchangeToggle } from "@/components/exchange-toggle"
import type { Quote } from "@/types/exchange"

export default function ExchangePage() {
  const [mode, setMode] = useState<"onramp" | "offramp">("onramp")
  const [quoteDirection, setQuoteDirection] = useState<"buy" | "sell">("buy")
  const [fromAmount, setFromAmount] = useState("")
  const [quote, setQuote] = useState<Quote | null>(null)

  const toggleQuoteDirection = () => {
    setQuoteDirection((prev) => (prev === "buy" ? "sell" : "buy"))
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-gradient-start via-gradient-mid to-gradient-end p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Exchange Mode Toggle */}
        <div className="flex justify-center">
          <ExchangeToggle mode={mode} onChange={setMode} />
        </div>

        <Card className="p-6 border-brutal border-black shadow-brutal-lg bg-card">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{mode === "onramp" ? "Buy Crypto" : "Sell Crypto"}</h1>
              <Button
                variant="outline"
                size="icon"
                className="border-brutal border-black shadow-brutal-sm hover:shadow-brutal-md transition-shadow"
              >
                <Wallet size={20} />
              </Button>
            </div>

            {/* You pay/send section */}
            <div className="space-y-2">
              <label className="font-medium">{mode === "onramp" ? "You pay" : "You send"}</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="border-brutal border-black shadow-brutal-sm bg-white"
                  placeholder="0.00"
                />
                <Select defaultValue={mode === "onramp" ? "INR" : "BTC"}>
                  <SelectTrigger className="w-[120px] border-brutal border-black shadow-brutal-sm bg-white">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {mode === "onramp" ? (
                      <>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exchange rate with fancy styling and toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-sm border-brutal border-black shadow-brutal-sm">
              <span className="text-sm font-medium">{quoteDirection === "buy" ? "1 BTC =" : "1 INR ="}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {quoteDirection === "buy"
                    ? `${quote?.rate || "0.00"} INR`
                    : `${1 / Number.parseFloat(quote?.rate || "1")} BTC`}
                </span>
                <Button variant="ghost" size="icon" onClick={toggleQuoteDirection} className="h-6 w-6">
                  {quoteDirection === "buy" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                </Button>
              </div>
            </div>

            {/* You get/receive section */}
            <div className="space-y-2">
              <label className="font-medium">{mode === "onramp" ? "You get" : "You receive"}</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={quote?.toAmount || "0.00"}
                  readOnly
                  className="border-brutal border-black shadow-brutal-sm bg-white"
                />
                <Select defaultValue={mode === "onramp" ? "BTC" : "INR"}>
                  <SelectTrigger className="w-[120px] border-brutal border-black shadow-brutal-sm bg-white">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {mode === "onramp" ? (
                      <>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment/Payout method with fancy styling */}
            <div className="space-y-2">
              <label className="font-medium">{quoteDirection === "buy" ? "Payment method" : "Payout method"}</label>
              <Button
                variant="outline"
                className="w-full justify-between border-brutal border-black shadow-brutal-sm hover:shadow-brutal-md transition-shadow bg-white"
              >
                <span className="flex items-center gap-2">
                  <Wallet size={20} className="text-primary" />
                  {quoteDirection === "buy" ? "Select payment method" : "Select payout method"}
                </span>
                <span className="text-secondary">→</span>
              </Button>
            </div>

            {/* Total with gradient background */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gradient-start to-gradient-mid text-white rounded-sm border-brutal border-black shadow-brutal-sm">
              <span>
                {quoteDirection === "buy"
                  ? `₹${fromAmount || "0.00"} all fees included`
                  : `${fromAmount || "0.00"} BTC all fees included`}
              </span>
              <Button variant="link" className="text-white hover:text-white/90 p-0">
                More
              </Button>
            </div>

            {/* Continue button with gradient animation */}
            <Button className="w-full bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end animate-gradient-flow text-white border-brutal border-black shadow-brutal-sm hover:shadow-brutal-md transition-shadow">
              Continue
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

