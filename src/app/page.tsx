import { getSupabaseAdmin } from '@/lib/supabase'
import type { Division, Standing, Journee } from '@/lib/types'
import StandingsTable from '@/components/StandingsTable'
import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'

const DIV_COLORS: Record<string, string> = {
  '01D0FB': 'border-cyan/40 bg-cyan/5',
  '3B82F6': 'border-blue-400/40 bg-blue-500/5',
  '8B5CF6': 'border-violet-400/40 bg-violet-500/5',
  '6B7280': 'border-gray-400/40 bg-gray-500/5',
  'EC4899': 'border-pink-400/40 bg-pink-500/5',
  'F97316': 'border-orange-400/40 bg-orange-500/5',
  '10B981': 'border-emerald-400/40 bg-emerald-500/5',
}

export const revalidate = 60 // revalidate every 60s

export default async function DashboardPage() {
  const sb = getSupabaseAdmin()
  const [{ data: divisions }, { data: allStandings }, { data: journees }] = await Promise.all([
    sb.from('divisions').select('*').order('display_order'),
    sb.from('standings').select('*'),
    sb.from('journees').select('*').order('number').limit(3),
  ])

  const standingsByDiv: Record<number, Standing[]> = {}
  ;(allStandings ?? []).forEach((s: Standing) => {
    if (!standingsByDiv[s.division_id]) standingsByDiv[s.division_id] = []
    standingsByDiv[s.division_id].push(s)
  })

  const nextJournee = (journees ?? []).find((j: Journee) => j.status !== 'completed')

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-navy to-navy-800 rounded-2xl border border-cyan/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">MPL Interclub Championship</h1>
            <p className="text-cyan text-sm mt-1">Saison 1 · 2026 – 2027 · 7 divisions · 38 clubs</p>
          </div>
          {nextJournee && (
            <div className="bg-cyan/10 border border-cyan/30 rounded-xl px-4 py-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Prochaine journée</div>
              <div className="font-bold text-cyan text-lg">J{nextJournee.number}</div>
              <div className="text-sm text-gray-300">{nextJournee.label}</div>
              <Link href="/calendar" className="text-xs text-cyan/70 hover:text-cyan mt-1 flex items-center justify-center gap-1">
                <Calendar size={11}/> Voir le calendrier
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Division cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(divisions ?? []).map((div: Division) => {
          const standings = (standingsByDiv[div.id] ?? []).slice(0, 4)
          const borderCls = DIV_COLORS[div.color] ?? 'border-white/10 bg-white/5'
          return (
            <div key={div.id}
              className={`rounded-xl border overflow-hidden ${borderCls}`}>
              {/* Division header */}
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: `1px solid #${div.color}30` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: `#${div.color}` }}/>
                  <span className="font-bold text-sm">{div.name}</span>
                  <span className="text-xs text-gray-500">{div.n_clubs} clubs</span>
                </div>
                <Link href={`/divisions/${div.id}`}
                  className="text-xs text-gray-500 hover:text-cyan flex items-center gap-0.5 transition">
                  Voir tout <ChevronRight size={12}/>
                </Link>
              </div>
              {/* Mini standings */}
              <div className="p-2">
                <StandingsTable standings={standings} compact />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
