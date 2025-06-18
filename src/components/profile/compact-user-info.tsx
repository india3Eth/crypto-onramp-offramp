"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, ChevronDown, ChevronUp, Check, Calendar, Flag, MapPin, Mail, AlertCircle, CreditCard } from "lucide-react"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

interface CompactUserInfoProps {
  user: {
    email: string
    isVerified?: boolean
    customerId?: string
    kycData?: {
      firstName?: string
      lastName?: string
      dateOfBirth?: string
      nationality?: string
      countryOfResidence?: string
      kycLevel?: string
    }
    kycStatus?: string
  }
}

export function CompactUserInfo({ user }: CompactUserInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Always show this component - it will display email and verification status
  const { firstName, lastName, dateOfBirth, nationality, countryOfResidence, kycLevel } = user.kycData || {}
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : null
  const isKycCompleted = user.kycStatus === 'COMPLETED' && fullName

  // Format date of birth
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Get country name from code (simplified)
  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom', 
      'DE': 'Germany',
      'FR': 'France',
      'ES': 'Spain',
      'CA': 'Canada',
      'AU': 'Australia',
      'JP': 'Japan',
      'CY': 'Cyprus'
    }
    return countries[code] || code
  }

  // Handle expand with scroll to top
  const handleExpand = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      // Scroll to top of card when expanding
      setTimeout(() => {
        const element = document.getElementById('user-info-card')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  return (
    <Card id="user-info-card" className={`${CARD_BRUTALIST_STYLE} p-6 mb-6`}>
      {/* Clickable Header */}
      <div 
        className={`
          ${isKycCompleted ? 'cursor-pointer' : ''} rounded-lg p-4 -m-4 mb-4 transition-all duration-200 
          ${isExpanded 
            ? 'hover:bg-green-50 border-l-4 border-green-500' 
            : isKycCompleted 
              ? 'hover:bg-gray-50 hover:shadow-md'
              : ''
          }
        `}
        onClick={isKycCompleted ? handleExpand : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-12 h-12 ${isKycCompleted ? 'bg-green-200' : 'bg-blue-200'} rounded-full flex items-center justify-center border-2 border-black`}>
              <User className={`h-6 w-6 ${isKycCompleted ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isKycCompleted ? (
                    <>
                      <h3 className="font-bold text-xl">{fullName}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-200 rounded-md border border-black">
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-bold text-green-700">Verified</span>
                      </div>
                    </>
                  ) : (
                    <h3 className="font-bold text-xl">Profile</h3>
                  )}
                </div>
                
                {/* Only show expand button if there are details to show */}
                {isKycCompleted && (
                  <div className="p-1 rounded-full bg-gray-100 border border-gray-300">
                    {isExpanded ? (
                      <ChevronUp className="h-6 w-6 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mt-1">
                {isExpanded ? (
                  <span className="font-medium">{kycLevel}</span>
                ) : (
                  <div className="space-y-1">
                    {/* Email with verification status */}
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{user.email}</span>
                      {user.isVerified ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-600" />
                      )}
                    </div>
                    
                    {isKycCompleted && kycLevel && (
                      <div className="text-xs font-medium">{kycLevel}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details - only show if KYC completed */}
      {isExpanded && isKycCompleted && (
        <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-3">
          {/* Email with verification status */}
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Email Address</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{user.email}</p>
                {user.isVerified ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                )}
              </div>
            </div>
          </div>

          {/* User ID */}
          {user.customerId && (
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Customer ID</p>
                <p className="text-sm font-medium font-mono">{user.customerId}</p>
              </div>
            </div>
          )}
          
          {dateOfBirth && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Date of Birth</p>
                <p className="text-sm font-medium">{formatDate(dateOfBirth)}</p>
              </div>
            </div>
          )}
          
          {nationality && (
            <div className="flex items-center gap-3">
              <Flag className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Nationality</p>
                <p className="text-sm font-medium">{getCountryName(nationality)}</p>
              </div>
            </div>
          )}
          
          {countryOfResidence && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Country of Residence</p>
                <p className="text-sm font-medium">{getCountryName(countryOfResidence)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}