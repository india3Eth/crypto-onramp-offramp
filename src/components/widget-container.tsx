"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function WidgetContainer({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { href: "/", label: "Exchange" },
    { href: "/about", label: "About Us" },
    { href: "/support", label: "Support" },
    { href: "/login", label: "Login" },
  ]

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="w-full max-w-md h-[600px] bg-purple-600 rounded-lg shadow-lg overflow-hidden flex flex-col">
        <header className="bg-yellow-400 text-black p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Crypto Exchange</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </header>

        {isMenuOpen && (
          <nav className="bg-green-500 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-2 px-4 ${pathname === item.href ? "bg-blue-600 text-white" : "hover:bg-blue-500 hover:text-white"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <main className="flex-grow overflow-y-auto p-4 bg-red-500">{children}</main>
      </div>
    </div>
  )
}

