import type React from "react"
import type { Metadata, Viewport } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"], 
  display: "swap",
})

export const metadata: Metadata = {
  title: "MP3.com Archive Search",
  description: "Search the MP3.com archive by track title or artist",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {}
      <body className={jetbrains.className}>{children}</body>
    </html>
  )
}
