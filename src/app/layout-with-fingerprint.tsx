import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

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
      <head>
        {/* Add Fingerprint.js for device ID generation */}
        <script src="https://cdn.gatefi.com/fingerprintjs/v1/fp.js" async></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}