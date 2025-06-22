"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, ArrowLeft, Building } from "lucide-react"
import { createSEPAAccount } from "@/app/actions/exchange/fiat-accounts"
import { CARD_BRUTALIST_STYLE } from "@/utils/common/constants"

interface AddSEPAAccountFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface FormData {
  accountNumber: string
  recipientFullAddress: string
  recipientAddressCountry: string
}

export function AddSEPAAccountForm({ onSuccess, onCancel }: AddSEPAAccountFormProps) {
  const [formData, setFormData] = useState<FormData>({
    accountNumber: '',
    recipientFullAddress: '',
    recipientAddressCountry: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const formatIBAN = (iban: string) => {
    // Remove spaces and convert to uppercase
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()
    
    // Add spaces every 4 characters for display
    return cleanIBAN.replace(/(.{4})/g, '$1 ').trim()
  }

  const handleIBANChange = (value: string) => {
    const formatted = formatIBAN(value)
    handleInputChange('accountNumber', formatted)
  }

  const validateForm = (): string | null => {
    if (!formData.accountNumber.trim()) {
      return "IBAN is required"
    }

    if (!formData.recipientFullAddress.trim()) {
      return "Recipient address is required"
    }

    if (!formData.recipientAddressCountry.trim()) {
      return "Country code is required"
    }

    // Basic IBAN validation
    const cleanIBAN = formData.accountNumber.replace(/\s/g, '').toUpperCase()
    if (!cleanIBAN.match(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/)) {
      return "Please enter a valid IBAN"
    }

    // Country code validation
    if (!formData.recipientAddressCountry.match(/^[A-Z]{2}$/)) {
      return "Please enter a 2-letter country code (e.g., BE, DE, FR)"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const result = await createSEPAAccount({
        accountNumber: formData.accountNumber.replace(/\s/g, ''), // Remove spaces for API
        recipientFullAddress: formData.recipientFullAddress.trim(),
        recipientAddressCountry: formData.recipientAddressCountry.trim().toUpperCase()
      })

      if (result.success) {
        onSuccess()
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error creating SEPA account:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={CARD_BRUTALIST_STYLE}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Add SEPA Bank Account
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Add your European bank account to receive funds
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IBAN Field */}
          <div>
            <label htmlFor="iban" className="block text-sm font-bold text-gray-700 mb-2">
              IBAN *
            </label>
            <Input
              id="iban"
              type="text"
              placeholder="e.g., BE78 9677 2070 2686"
              value={formData.accountNumber}
              onChange={(e) => handleIBANChange(e.target.value)}
              className="border-2 border-gray-300 focus:border-black"
              maxLength={34} // Maximum IBAN length with spaces
            />
            <p className="text-xs text-gray-500 mt-1">
              International Bank Account Number (IBAN)
            </p>
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">
              Full Address *
            </label>
            <Textarea
              id="address"
              placeholder="e.g., 123 Main Street, Brussels, 1000"
              value={formData.recipientFullAddress}
              onChange={(e) => handleInputChange('recipientFullAddress', e.target.value)}
              className="border-2 border-gray-300 focus:border-black"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Complete address including street, city, and postal code
            </p>
          </div>

          {/* Country Code Field */}
          <div>
            <label htmlFor="country" className="block text-sm font-bold text-gray-700 mb-2">
              Country Code *
            </label>
            <Input
              id="country"
              type="text"
              placeholder="e.g., BE"
              value={formData.recipientAddressCountry}
              onChange={(e) => handleInputChange('recipientAddressCountry', e.target.value.toUpperCase())}
              className="border-2 border-gray-300 focus:border-black"
              maxLength={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              2-letter ISO country code (BE, DE, FR, etc.)
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-4 bg-red-100 text-red-600 border-2 border-red-600 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-bold"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size={16} text="" className="mr-2" />
                  Adding Account...
                </div>
              ) : (
                "Add Account"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}