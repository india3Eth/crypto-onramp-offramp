"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface FeesDialogProps {
  mode: "onramp" | "offramp"
  fees: {
    processing?: string
    network?: string
    total: string
  }
}

export function FeesDialog({ mode, fees }: FeesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-white hover:text-white/90 p-0">
          More
        </Button>
      </DialogTrigger>
      <DialogContent className="border-brutal border-white bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Fee Breakdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Processing Fee</span>
              <span>{fees.processing || "0.00"}</span>
            </div>
            {mode === "onramp" && (
              <div className="flex justify-between">
                <span>Network Fee</span>
                <span>{fees.network || "0.00"}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/20 pt-2">
              <span className="font-bold">Total Fees</span>
              <span className="font-bold">{fees.total}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

