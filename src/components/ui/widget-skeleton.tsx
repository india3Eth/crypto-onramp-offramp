"use client"

import { Card } from "@/components/ui/card"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

export function WidgetSkeleton() {
  return (
    <Card className={`${CARD_BRUTALIST_STYLE} p-3`}>
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 rounded w-32 skeleton-gradient animate-skeleton"></div>
          <div className="h-10 w-24 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] skeleton-gradient animate-skeleton"></div>
        </div>

        {/* You Pay section */}
        <div className="space-y-2">
          <div className="h-4 rounded w-16 skeleton-gradient animate-skeleton"></div>
          <div className="flex gap-2">
            <div className="flex-1 h-12 border-2 border-gray-300 rounded skeleton-gradient animate-skeleton"></div>
            <div className="h-12 w-20 border-2 border-gray-300 rounded skeleton-gradient animate-skeleton"></div>
          </div>
        </div>

        {/* Rate display skeleton */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div className="skeleton-gradient animate-skeleton h-4 w-32 rounded"></div>
            
            <div className="flex items-center gap-2">
              <div className="skeleton-gradient animate-skeleton h-7 w-12 rounded-full"></div>
              <div className="skeleton-gradient animate-skeleton h-8 w-8 rounded-full"></div>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-blue-200">
            <div className="space-y-1">
              <div className="skeleton-gradient animate-skeleton h-3 w-24 rounded"></div>
              <div className="skeleton-gradient animate-skeleton h-3 w-28 rounded"></div>
            </div>
          </div>
        </div>

        {/* You Get section */}
        <div className="space-y-2">
          <div className="h-4 rounded w-16 skeleton-gradient animate-skeleton"></div>
          <div className="flex gap-2">
            <div className="flex-1 h-12 border-2 border-gray-300 rounded skeleton-gradient animate-skeleton"></div>
            <div className="h-12 w-24 border-2 border-gray-300 rounded skeleton-gradient animate-skeleton"></div>
          </div>
        </div>

        {/* Payment Method section */}
        <div className="space-y-2">
          <div className="h-4 rounded w-24 skeleton-gradient animate-skeleton"></div>
          <div className="h-12 border-2 border-gray-300 rounded skeleton-gradient animate-skeleton"></div>
        </div>

        {/* Continue button skeleton */}
        <div className="h-12 border-2 border-gray-400 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] skeleton-gradient animate-skeleton"></div>
      </div>
    </Card>
  )
}