import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Inter as V0_Font_Inter, IBM_Plex_Mono as V0_Font_IBM_Plex_Mono } from 'next/font/google'

// Initialize fonts
const _inter = V0_Font_Inter({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _ibmPlexMono = V0_Font_IBM_Plex_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700"] })

export const metadata: Metadata = {
  title: 'FL SHORTCUTS',
  description: 'Complete FL Studio keyboard shortcuts reference with voting system',
  generator: 'v0.app',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-mono antialiased overscroll-none`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
