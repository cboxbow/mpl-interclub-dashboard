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
        <div className="relative border-b border-cyan/15 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-1 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan drop-shadow-[0_0_14px_rgba(1,208,251,0.7)]">
              Interclub 2026
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              Every club. Every player. Every point counts.
            </span>
          </div>
        </div>
        <main className="relative max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
