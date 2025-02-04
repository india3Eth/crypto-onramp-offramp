"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")

  return (
    <div className="min-h-screen bg-muted p-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 border-brutal border-black shadow-brutal-lg bg-white">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-gray-500">Enter your email to continue</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-brutal border-black shadow-brutal-sm"
              />
            </div>

            <Button className="w-full bg-black text-white border-brutal border-black shadow-brutal-sm hover:shadow-brutal-md transition-shadow">
              <Mail className="mr-2" size={20} />
              Continue with Email
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

