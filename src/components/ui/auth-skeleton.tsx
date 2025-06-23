"use client"

import { Card } from "@/components/ui/card"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

interface AuthSkeletonProps {
  variant?: "login" | "profile" | "generic"
  text?: string
}

export function AuthSkeleton({ variant = "generic", text = "Loading..." }: AuthSkeletonProps) {
  if (variant === "login") {
    return (
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white p-6" style={{height: "420px"}}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-200 rounded-full border-2 border-black skeleton-gradient animate-skeleton"></div>
            <div className="h-8 w-48 skeleton-gradient animate-skeleton rounded"></div>
            <div className="h-4 w-64 skeleton-gradient animate-skeleton rounded"></div>
          </div>

          {/* Form skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-24 skeleton-gradient animate-skeleton rounded"></div>
              <div className="h-12 border-2 border-gray-300 skeleton-gradient animate-skeleton rounded"></div>
            </div>
            
            <div className="h-12 border-2 border-gray-400 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] skeleton-gradient animate-skeleton"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (variant === "profile") {
    return (
      <div className="space-y-6">
        {/* Profile card skeleton */}
        <Card className={`${CARD_BRUTALIST_STYLE} p-6`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-200 rounded-full border-2 border-black skeleton-gradient animate-skeleton"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 w-32 skeleton-gradient animate-skeleton rounded"></div>
                <div className="h-4 w-48 skeleton-gradient animate-skeleton rounded"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-4 w-24 skeleton-gradient animate-skeleton rounded"></div>
              <div className="h-10 w-full skeleton-gradient animate-skeleton rounded"></div>
            </div>
          </div>
        </Card>

        {/* Additional sections skeleton */}
        <Card className={`${CARD_BRUTALIST_STYLE} p-6`}>
          <div className="space-y-4">
            <div className="h-6 w-40 skeleton-gradient animate-skeleton rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 skeleton-gradient animate-skeleton rounded"></div>
              <div className="h-20 skeleton-gradient animate-skeleton rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Generic auth skeleton
  return (
    <Card className={`${CARD_BRUTALIST_STYLE} p-6`}>
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-blue-200 rounded-full border-2 border-black skeleton-gradient animate-skeleton"></div>
        <div className="space-y-3 w-full max-w-sm">
          <div className="h-6 w-32 skeleton-gradient animate-skeleton rounded mx-auto"></div>
          <div className="h-4 w-48 skeleton-gradient animate-skeleton rounded mx-auto"></div>
        </div>
        <div className="space-y-4 w-full">
          <div className="h-12 skeleton-gradient animate-skeleton rounded"></div>
          <div className="h-12 skeleton-gradient animate-skeleton rounded"></div>
        </div>
        {text && (
          <div className="text-center text-sm text-gray-500 mt-2">{text}</div>
        )}
      </div>
    </Card>
  )
}