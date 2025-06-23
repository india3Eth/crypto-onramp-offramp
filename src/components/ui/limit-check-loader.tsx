"use client"

import { Card } from "@/components/ui/card"
import { Shield, Check, Clock, TrendingUp } from "lucide-react"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

interface LimitCheckLoaderProps {
  text?: string
}

export function LimitCheckLoader({ text = "Checking your transaction limits..." }: LimitCheckLoaderProps) {
  return (
    <Card className={`${CARD_BRUTALIST_STYLE} p-8`}>
      <div className="flex flex-col items-center space-y-6">
        {/* Animated icon stack */}
        <div className="relative">
          {/* Background circle */}
          <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-300 flex items-center justify-center">
            {/* Main shield icon */}
            <Shield className="w-12 h-12 text-blue-600 animate-pulse" />
            
            {/* Orbiting icons */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="relative w-24 h-24">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-gray-800">{text}</h3>
          <p className="text-sm text-gray-600">
            We're verifying your account limits to ensure a smooth transaction
          </p>
        </div>

        {/* Animated progress dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Security badges */}
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Encrypted</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Compliant</span>
          </div>
        </div>
      </div>
    </Card>
  )
}