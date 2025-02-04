"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function KYCPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    countryOfResidence: "",
  })

  return (
    <div className="min-h-screen bg-muted p-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 border-brutal border-black shadow-brutal-lg bg-white">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <Shield className="mx-auto h-12 w-12" />
            <h1 className="text-2xl font-bold">Verify your identity</h1>
            <p className="text-sm text-gray-500">Complete KYC to start trading</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-medium">First name</label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="border-brutal border-black shadow-brutal-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="font-medium">Last name</label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="border-brutal border-black shadow-brutal-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Date of birth</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                className="border-brutal border-black shadow-brutal-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Nationality</label>
              <Input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData((prev) => ({ ...prev, nationality: e.target.value }))}
                className="border-brutal border-black shadow-brutal-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Country of residence</label>
              <Input
                type="text"
                value={formData.countryOfResidence}
                onChange={(e) => setFormData((prev) => ({ ...prev, countryOfResidence: e.target.value }))}
                className="border-brutal border-black shadow-brutal-sm"
              />
            </div>

            <Button className="w-full bg-black text-white border-brutal border-black shadow-brutal-sm hover:shadow-brutal-md transition-shadow">
              Submit verification
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

