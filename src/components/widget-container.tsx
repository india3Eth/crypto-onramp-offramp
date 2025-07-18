"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, User, HelpCircle, CreditCard, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WidgetContainerProps {
  children: React.ReactNode
}

export function WidgetContainer({ children }: WidgetContainerProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()

  // Check if the device is mobile based on screen width
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640 // 640px is the sm breakpoint in Tailwind
      setIsMobileView(mobile)
      if (!isInitialized) {
        setIsInitialized(true)
      }
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [isInitialized])

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  // Show loading state until initialization is complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-purple-700 via-indigo-800 to-blue-900">
        <div className="relative w-full max-w-md h-[700px] bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
          <header className="bg-blue-500 text-white p-4 border-b-4 border-black flex justify-between items-center">
            <h1 className="text-xl font-bold">Crypto Exchange</h1>
            <div className="w-6 h-6"></div>
          </header>
          <main className="flex-grow overflow-y-auto p-4 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin text-blue-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
              <p className="text-gray-500">Loading...</p>
            </div>
          </main>
          <nav className="bg-gray-100 border-t-4 border-black p-2">
            <div className="flex justify-around">
              <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen w-full flex items-center justify-center transition-all duration-300",
      // Show background gradient on desktop/tablet, plain white on mobile
      !isMobileView && "bg-gradient-to-b from-purple-700 via-indigo-800 to-blue-900"
    )}>
      {/* Floating shapes in background for neo-brutalism aesthetic (desktop/tablet only) */}
      {!isMobileView && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
          <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-400 rounded-lg rotate-12 transform-gpu animate-float opacity-20"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-pink-500 rounded-lg -rotate-12 transform-gpu animate-float opacity-20"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-400 rounded-lg rotate-45 transform-gpu animate-float opacity-20"></div>
        </div>
      )}

      {/* Widget container - square on mobile, rounded on desktop */}
      <div className={cn(
        "relative w-full max-w-md h-[700px] bg-white border-4 border-black overflow-hidden flex flex-col transition-all duration-300",
        // Rounded corners on desktop/tablet, square on mobile
        isMobileView
          ? "rounded-none shadow-none"
          : "rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]",
        // Full screen on mobile
        isMobileView && "h-screen max-h-screen"
      )} suppressHydrationWarning>
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
                <li>
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center p-3 rounded-lg font-medium transition-colors",
                      pathname === "/"
                        ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home size={20} className="mr-3" />
                    Exchange
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center p-3 rounded-lg font-medium transition-colors",
                      pathname === "/profile"
                        ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={20} className="mr-3" />
                    Profile
                  </Link>
                </li>


                <li>
                  <Link
                    href="/transactions"
                    className={cn(
                      "flex items-center p-3 rounded-lg font-medium transition-colors",
                      pathname === "/transactions"
                        ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Clock size={20} className="mr-3" />
                    Transactions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className={cn(
                      "flex items-center p-3 rounded-lg font-medium transition-colors",
                      pathname === "/support"
                        ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <CreditCard size={20} className="mr-3" />
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className={cn(
                      "flex items-center p-3 rounded-lg font-medium transition-colors",
                      pathname === "/about"
                        ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HelpCircle size={20} className="mr-3" />
                    About Us
                  </Link>
                </li>
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
            {/* Custom bottom navigation items */}
            <li>
              <Link
                href="/"
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg font-medium",
                  pathname === "/"
                    ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                    : "hover:bg-gray-200"
                )}
              >
                <Home size={20} />
                <span className="text-xs mt-1">Exchange</span>
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg font-medium",
                  pathname === "/profile"
                    ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                    : "hover:bg-gray-200"
                )}
              >
                <User size={20} />
                <span className="text-xs mt-1">Profile</span>
              </Link>
            </li>

            <li>
              <Link
                href="/support"
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg font-medium",
                  pathname === "/support"
                    ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                    : "hover:bg-gray-200"
                )}
              >
                <CreditCard size={20} />
                <span className="text-xs mt-1">Support</span>
              </Link>
            </li>
            <li>
              <Link
                href="/transactions"
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg font-medium",
                  pathname === "/transactions"
                    ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                    : "hover:bg-gray-200"
                )}
              >
                <Clock size={20} />
                <span className="text-xs mt-1">Transactions</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}