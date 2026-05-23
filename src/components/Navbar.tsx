'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, Calendar, Settings, BarChart3 } from 'lucide-react'

const links = [
  { href: '/',          label: 'Dashboard',  icon: BarChart3  },
  { href: '/calendar',  label: 'Calendrier', icon: Calendar   },
  { href: '/admin',     label: 'Admin',      icon: Settings   },
]

export default function Navbar() {
  const path = usePathname()
  return (
    <nav className="sticky top-0 z-50 bg-navy border-b border-cyan/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-cyan text-lg mr-4 shrink-0">
          <Trophy size={20} />
          <span className="hidden sm:block">MPL Interclub 2026</span>
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
