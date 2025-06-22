"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, Plus, CreditCard, Building, CheckCircle2 } from "lucide-react"
import { getUserFiatAccounts } from "@/app/actions/exchange/fiat-accounts"
import { AddSEPAAccountForm } from "./add-sepa-account-form"
import type { FiatAccount } from "@/services/fiat-account-service"
import { fiatAccountService } from "@/services/fiat-account-service"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

interface FiatAccountSelectorProps {
  selectedAccountId?: string
  onAccountSelect: (accountId: string) => void
  onAccountAdded?: () => void
}

export function FiatAccountSelector({
  selectedAccountId,
  onAccountSelect,
  onAccountAdded
}: FiatAccountSelectorProps) {
  const [fiatAccounts, setFiatAccounts] = useState<FiatAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Load fiat accounts
  useEffect(() => {
    loadFiatAccounts()
  }, [])

  const loadFiatAccounts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getUserFiatAccounts()
      
      if (result.success && result.fiatAccounts) {
        setFiatAccounts(result.fiatAccounts)
        
        // Auto-select first account if none selected
        if (result.fiatAccounts.length > 0 && !selectedAccountId) {
          onAccountSelect(result.fiatAccounts[0].fiatAccountId)
        }
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error loading fiat accounts:", error)
      setError("Failed to load fiat accounts")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountAdded = () => {
    setShowAddForm(false)
    loadFiatAccounts()
    if (onAccountAdded) {
      onAccountAdded()
    }
  }

  const renderAccountIcon = (account: FiatAccount) => {
    if (account.accountDetails.type === 'SEPA') {
      return <Building className="h-5 w-5 text-blue-600" />
    } else if (account.accountDetails.type === 'CARD') {
      return <CreditCard className="h-5 w-5 text-green-600" />
    }
    return <Building className="h-5 w-5 text-gray-600" />
  }

  const renderAccountDetails = (account: FiatAccount) => {
    if (account.accountDetails.type === 'CARD') {
      const cardDetails = account.accountDetails
      const isExpired = fiatAccountService.isAccountExpired(account)
      
      return (
        <div className="text-sm text-gray-600">
          <div>{cardDetails.cardType} • {cardDetails.network}</div>
          <div>**** {cardDetails.lastFour}</div>
          <div className={isExpired ? "text-red-600" : "text-gray-500"}>
            Expires: {new Date(cardDetails.expiration).toLocaleDateString()}
            {isExpired && " (Expired)"}
          </div>
        </div>
      )
    }
    
    return (
      <div className="text-sm text-gray-600">
        <div>Bank Account</div>
        <div>Added: {new Date(account.createdAt).toLocaleDateString()}</div>
      </div>
    )
  }

  if (showAddForm) {
    return (
      <AddSEPAAccountForm
        onSuccess={handleAccountAdded}
        onCancel={() => setShowAddForm(false)}
      />
    )
  }

  return (
    <Card className={CARD_BRUTALIST_STYLE}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Select Fiat Account</CardTitle>
        <p className="text-sm text-gray-600">
          Choose where you want to receive your fiat currency
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Loading fiat accounts..." />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 text-red-600 border-2 border-red-600 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && fiatAccounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No fiat accounts found</p>
            <p className="text-sm mb-4">Add a SEPA bank account to receive your funds</p>
          </div>
        )}

        {!isLoading && !error && fiatAccounts.length > 0 && (
          <div className="space-y-3">
            {fiatAccounts.map((account) => {
              const isSelected = selectedAccountId === account.fiatAccountId
              const isExpired = fiatAccountService.isAccountExpired(account)
              
              return (
                <div
                  key={account.fiatAccountId}
                  className={`p-4 border-2 rounded-md cursor-pointer transition-all ${
                    isSelected 
                      ? "border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]" 
                      : "border-gray-300 hover:border-gray-400"
                  } ${isExpired ? "opacity-60" : ""}`}
                  onClick={() => !isExpired && onAccountSelect(account.fiatAccountId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {renderAccountIcon(account)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold">
                            {fiatAccountService.formatAccountDisplayName(account)}
                          </h3>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          {isExpired && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                              Expired
                            </span>
                          )}
                        </div>
                        {renderAccountDetails(account)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add new account button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full border-2 border-gray-300 hover:border-gray-400 font-bold"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add SEPA Bank Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}