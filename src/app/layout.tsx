import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WidgetContainer } from "@/components/widget-container"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crypto Exchange",
  description: "Buy and sell cryptocurrency with our secure platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WidgetContainer>{children}</WidgetContainer>
      </body>
    </html>
  )
}