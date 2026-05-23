import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'MPL Interclub Championship 2026',
  description: 'Mauritius Padel League — Compétition interclubs officielle',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen site-bg">
        <Navbar />
        <main className="relative max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
