"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, User, HelpCircle, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WidgetContainerProps {
  children: React.ReactNode
}

export function WidgetContainer({ children }: WidgetContainerProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const pathname = usePathname()

  // Check if the device is mobile based on screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640) // 640px is the sm breakpoint in Tailwind
    }
    
    // Initial check
    checkMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    { href: "/exchange", label: "Exchange", icon: <Home size={20} /> },
    { href: "/kyc", label: "Verify", icon: <User size={20} /> },
    { href: "/about", label: "About Us", icon: <HelpCircle size={20} /> },
    { href: "/support", label: "Support", icon: <CreditCard size={20} /> },
  ]

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <div className={cn(
      "min-h-screen w-full flex items-center justify-center",
      // Show background gradient on desktop/tablet, plain white on mobile
      !isMobileView && "bg-gradient-to-b from-purple-700 via-indigo-800 to-blue-900"
    )}>
      {/* Floating shapes in background for neo-brutalism aesthetic (desktop/tablet only) */}
      {!isMobileView && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-400 rounded-lg rotate-12 transform-gpu animate-float opacity-20"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-pink-500 rounded-lg -rotate-12 transform-gpu animate-float opacity-20"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-400 rounded-lg rotate-45 transform-gpu animate-float opacity-20"></div>
        </div>
      )}
      
      {/* Widget container - square on mobile, rounded on desktop */}
      <div className={cn(
        "relative w-full max-w-md h-[650px] bg-white border-4 border-black overflow-hidden flex flex-col",
        // Rounded corners on desktop/tablet, square on mobile
        isMobileView 
          ? "rounded-none shadow-none" 
          : "rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]",
        // Full screen on mobile
        isMobileView && "h-screen max-h-screen"
      )}>
        {/* Widget header */}
        <header className="bg-blue-500 text-white p-4 border-b-4 border-black flex justify-between items-center">
          <h1 className="text-xl font-bold">Crypto Exchange</h1>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white hover:bg-blue-600">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </header>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-white border-b-4 border-black z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
            <nav className="p-2">
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className={cn(
                        "flex items-center p-3 rounded-lg font-medium transition-colors",
                        pathname === item.href
                          ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Widget content */}
        <main className="flex-grow overflow-y-auto p-4 scrollbar-hide">
          {children}
        </main>

        {/* Widget bottom navigation */}
        <nav className="bg-gray-100 border-t-4 border-black p-2">
          <ul className="flex justify-around">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg font-medium",
                    pathname === item.href
                      ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                      : "hover:bg-gray-200"
                  )}
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}