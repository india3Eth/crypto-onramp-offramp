import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WidgetContainer } from "@/components/widget-container"
import { FloatingBackground } from "@/components/floating-background"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crypto Exchange",
  description: "Buy and sell cryptocurrency",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FloatingBackground />
        <WidgetContainer>{children}</WidgetContainer>
      </body>
    </html>
  )
}

