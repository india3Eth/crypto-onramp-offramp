import { Card } from "@/components/ui/card"
import { Shield, Zap, Globe, Coins } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-yellow-300 border-4 border-black p-5 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
        <h1 className="text-2xl font-bold mb-4">About Us</h1>
        <p className="mb-4 font-medium">
          Welcome to our Crypto Exchange, where we make buying and selling 
          cryptocurrencies easy and secure with a brutal simplicity.
        </p>
        <p className="font-medium">
          Founded in 2023, we're committed to democratizing access to the 
          digital asset economy and empowering individuals to take control 
          of their financial future.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <FeatureCard 
          title="Secure" 
          description="Enterprise-grade security to protect your assets" 
          icon={<Shield className="h-8 w-8" />} 
          color="bg-pink-400"
        />
        
        <FeatureCard 
          title="Fast" 
          description="Lightning-fast transactions and confirmations" 
          icon={<Zap className="h-8 w-8" />} 
          color="bg-cyan-400"
        />
        
        <FeatureCard 
          title="Global" 
          description="Accessible from anywhere in the world" 
          icon={<Globe className="h-8 w-8" />} 
          color="bg-green-400"
        />
        
        <FeatureCard 
          title="Low Fees" 
          description="Competitive rates with transparent fee structure" 
          icon={<Coins className="h-8 w-8" />} 
          color="bg-purple-400"
        />
      </div>

      <Card className="bg-gray-100 border-4 border-black p-5 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
        <h2 className="text-xl font-bold mb-3">Our Mission</h2>
        <p className="font-medium">
          We believe in a world where everyone should have access to financial 
          tools without complexity. Our platform leverages the latest in blockchain 
          technology to provide you with a seamless trading experience.
        </p>
      </Card>
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

function FeatureCard({ title, description, icon, color }: FeatureCardProps) {
  return (
    <div className={`${color} border-4 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}>
      <div className="flex items-start space-x-3">
        <div className="bg-white p-2 rounded-full border-2 border-black">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm font-medium">{description}</p>
        </div>
      </div>
    </div>
  )
}