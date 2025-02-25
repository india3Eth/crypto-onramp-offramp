import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <Card className="max-w-md mx-auto p-6 border-brutal border-brutalism-red bg-secondary shadow-brutal">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            className="w-full border-brutal border-brutalism-green bg-text text-background"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            className="w-full border-brutal border-brutalism-green bg-text text-background"
          />
        </div>
        <Button className="w-full bg-brutalism-blue hover:bg-brutalism-blue/90 text-white border-brutal border-brutalism-purple">
          Log In
        </Button>
      </form>
    </Card>
  )
}

