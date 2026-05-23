import { getSupabaseAdmin } from '@/lib/supabase'
import type { Division, Standing, Journee } from '@/lib/types'
import StandingsTable from '@/components/StandingsTable'
import Countdown from '@/components/Countdown'
import Link from 'next/link'
import { Calendar, ChevronRight, ShieldCheck, TrendingUp, Users } from 'lucide-react'

const DIV_COLORS: Record<string, string> = {
  '01D0FB': 'border-cyan/40 bg-cyan/5',
  '3B82F6': 'border-blue-400/40 bg-blue-500/5',
  '8B5CF6': 'border-violet-400/40 bg-violet-500/5',
  '6B7280': 'border-gray-400/40 bg-gray-500/5',
  'EC4899': 'border-pink-400/40 bg-pink-500/5',
  'F97316': 'border-orange-400/40 bg-orange-500/5',
  '10B981': 'border-emerald-400/40 bg-emerald-500/5',
}

export const revalidate = 60

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
  const campaignClubCount = 18

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="neon-rule relative p-6 sm:p-8">
          <div className="absolute inset-x-0 bottom-0 h-px bg-cyan shadow-[0_0_28px_rgba(1,208,251,0.95)]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-xs font-bold uppercase tracking-[0.34em] interclub-blue-text mb-2">
                One island. {campaignClubCount} clubs. 1 identity.
              </div>
              <h1 className="interclub-title text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-none">
                Interclub 2026
              </h1>
              <p className="text-cyan text-sm sm:text-base mt-3 font-semibold uppercase tracking-[0.2em]">
                Every club. Every player. Every point counts.
              </p>
              <p className="text-gray-300 text-sm mt-3">
                Saison 1 · 2026 - 2027 · 7 divisions · championnat officiel Mauritius Padel League.
              </p>
            </div>
            {nextJournee && (
              <div className="w-full md:w-[320px]">
                <Countdown date={nextJournee.date} label={`J${nextJournee.number} - ${nextJournee.label}`} />
                <Link href="/calendar" className="text-xs text-cyan/80 hover:text-cyan mt-2 flex items-center justify-center gap-1">
                  <Calendar size={11}/> Voir le calendrier
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4">
          <Users size={22} className="text-cyan mb-3"/>
          <div className="font-black uppercase text-white">Every club</div>
          <p className="text-sm text-gray-300 mt-1">Chaque division garde son identite, son classement et son calendrier.</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <TrendingUp size={22} className="text-cyan mb-3"/>
          <div className="font-black uppercase text-white">Every point counts</div>
          <p className="text-sm text-gray-300 mt-1">PTS, paires, sets et jeux departagent les clubs jusqu'au dernier match.</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <ShieldCheck size={22} className="text-cyan mb-3"/>
          <div className="font-black uppercase text-white">Play up allowed</div>
          <p className="text-sm text-gray-300 mt-1">Play down forbidden: la regle fondamentale Interclub 2026 reste visible.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(divisions ?? []).map((div: Division) => {
          const standings = (standingsByDiv[div.id] ?? []).slice(0, 4)
          const borderCls = DIV_COLORS[div.color] ?? 'border-white/10 bg-white/5'
          return (
            <div key={div.id} className={`rounded-xl border overflow-hidden ${borderCls}`}>
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
