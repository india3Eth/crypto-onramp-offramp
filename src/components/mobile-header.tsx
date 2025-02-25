"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-brutalism-blue text-white">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Crypto Exchange</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {isMenuOpen && (
        <nav className="p-4 bg-brutalism-purple">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="block py-2 px-4 hover:bg-brutalism-blue">
                Exchange
              </Link>
            </li>
            <li>
              <Link href="/about" className="block py-2 px-4 hover:bg-brutalism-blue">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/support" className="block py-2 px-4 hover:bg-brutalism-blue">
                Support
              </Link>
            </li>
            <li>
              <Button className="w-full bg-brutalism-yellow text-background hover:bg-brutalism-yellow/90">Login</Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

