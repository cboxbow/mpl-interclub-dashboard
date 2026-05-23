'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Calendar, Settings, BarChart3, BookOpen } from 'lucide-react'

const links = [
  { href: '/',          label: 'Dashboard',  icon: BarChart3  },
  { href: '/calendar',  label: 'Calendrier', icon: Calendar   },
  { href: '/rules',     label: 'Reglement',  icon: BookOpen   },
  { href: '/admin',     label: 'Admin',      icon: Settings   },
]

export default function Navbar() {
  const path = usePathname()
  return (
    <nav className="sticky top-0 z-50 bg-navy/85 border-b border-cyan/30 shadow-[0_10px_35px_rgba(1,208,251,0.12)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 sm:gap-6 h-16">
        <Link href="/" className="flex items-center mr-2 sm:mr-4 shrink-0" aria-label="MPL Interclub dashboard">
          <Image
            src="/mpl-msra.png"
            alt="Mauritius Squash Rackets Association et Mauritius Padel League"
            width={205}
            height={64}
            priority
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition
              ${path === href || (href !== '/' && path.startsWith(href))
                ? 'bg-cyan text-navy font-semibold'
                : 'text-gray-300 hover:text-cyan hover:bg-white/5'
              }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
        <div className="ml-auto text-xs text-gray-500 hidden md:block">
          Saison 1 · 3e vendredi/mois
        </div>
      </div>
    </nav>
  )
}
