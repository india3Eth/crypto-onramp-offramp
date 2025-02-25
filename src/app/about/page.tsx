import { Card } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <Card className="bg-green-300 border-4 border-purple-600 p-4 rounded-lg shadow-lg overflow-y-auto max-h-full">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">About Us</h1>
      <p className="mb-4 text-red-700">
        Welcome to our Crypto Exchange, where we make buying and selling cryptocurrencies easy and secure.
      </p>
      <p className="mb-4 text-purple-700">
        Our platform leverages the latest in blockchain technology to provide you with a seamless trading experience.
        Whether you're a seasoned trader or new to the world of crypto, we've got you covered.
      </p>
      <p className="text-orange-700">
        Founded in 2023, we're committed to democratizing access to the digital asset economy and empowering individuals
        to take control of their financial future.
      </p>
    </Card>
  )
}

