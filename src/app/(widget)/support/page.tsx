import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function SupportPage() {
  return (
    <Card className="max-w-2xl mx-auto p-6 border-brutal border-brutalism-red bg-secondary shadow-brutal">
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      <p className="mb-4">
        Need help? We're here for you. Fill out the form below and we'll get back to you as soon as possible.
      </p>
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <Input id="name" className="w-full border-brutal border-brutalism-green bg-text text-background" />
        </div>
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
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <Textarea
            id="message"
            className="w-full border-brutal border-brutalism-purple bg-text text-background"
            rows={4}
          />
        </div>
        <Button className="w-full bg-brutalism-yellow hover:bg-brutalism-yellow/90 text-background border-brutal border-brutalism-purple">
          Send Message
        </Button>
      </form>
    </Card>
  )
}

