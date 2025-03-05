"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Coins, 
  CreditCard, 
  Users, 
  Settings,
  LogOut,
  BarChart,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
  const pathname = usePathname()
  
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Crypto Assets",
      href: "/admin/crypto",
      icon: Coins,
    },
    {
      name: "Payment Methods",
      href: "/admin/payment-methods",
      icon: CreditCard,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo and title */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="font-bold text-xl">Crypto Admin</h1>
            <p className="text-xs text-gray-500">Management Console</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 flex-shrink-0",
                isActive ? "text-blue-600" : "text-gray-400"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      {/* User and logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
          
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={() => console.log("Logout")}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}