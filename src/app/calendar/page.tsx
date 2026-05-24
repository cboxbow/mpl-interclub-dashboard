import { getSupabaseAdmin } from '@/lib/supabase'
import type { Journee, Match, Division } from '@/lib/types'
import { CalendarDays, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 3600

export default async function CalendarPage() {
  const sb = getSupabaseAdmin()
  const [{ data: journees }, { data: matches }, { data: divisions }] = await Promise.all([
    sb.from('journees').select('*').order('number'),
    sb.from('matches').select('division_id, journee_id, status'),
    sb.from('divisions').select('*').order('display_order'),
  ])

  // Per journée, count matches per division
  type JCount = { div: Division; total: number; done: number }
  const jStats: Record<number, JCount[]> = {}
  ;(journees ?? []).forEach((j: Journee) => {
    jStats[j.id] = (divisions ?? []).map((d: Division) => {
      const ms = (matches ?? []).filter((m: any) => m.journee_id === j.id && m.division_id === d.id)
      return { div: d, total: ms.length, done: ms.filter((m: any) => m.status === 'completed').length }
    }).filter(x => x.total > 0)
  })

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={22} className="text-cyan"/>
              <h1 className="interclub-title text-3xl sm:text-4xl font-black uppercase">Calendrier officiel</h1>
            </div>
            <p className="text-sm text-cyan mt-2 font-semibold uppercase tracking-[0.18em]">
              Every club. Every player. Every point counts.
            </p>
            <p className="text-sm text-gray-400 mt-1">3e vendredi de chaque mois</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-cyan/20 bg-cyan/10 p-3 max-w-md">
            <ShieldCheck size={20} className="text-cyan shrink-0 mt-0.5"/>
            <div>
              <div className="text-sm font-black uppercase text-white">Play up allowed</div>
              <div className="text-xs text-gray-300">Play down forbidden: regle fondamentale Interclub 2026.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(journees ?? []).map((j: Journee) => {
          const stats = jStats[j.id] ?? []
          const totalM = stats.reduce((s,x)=>s+x.total,0)
          const doneM  = stats.reduce((s,x)=>s+x.done,0)
          const pct    = totalM ? Math.round(doneM*100/totalM) : 0
          const isPast = new Date(j.date) < new Date()

          return (
            <div key={j.id}
              className={`rounded-xl border p-4 space-y-3
                ${j.status==='completed' ? 'border-green-500/30 bg-green-900/10'
                : j.status==='active'    ? 'border-cyan/50 bg-cyan/5 ring-1 ring-cyan/20'
                : isPast                 ? 'border-white/10 bg-white/3 opacity-70'
                : 'border-white/10 bg-navy-800/30'}`}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-cyan text-lg">J{j.number}</div>
                  <div className="text-sm text-gray-300">{j.label}</div>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${j.status==='completed' ? 'bg-green-500/20 text-green-400'
                  : j.status==='active'    ? 'bg-cyan/20 text-cyan'
                  : 'bg-white/10 text-gray-500'}`}>
                  {j.status==='completed' ? 'Terminé' : j.status==='active' ? '🔴 Live' : 'À venir'}
                </div>
              </div>

              {/* Progress bar */}
              {totalM > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{doneM}/{totalM} matchs</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan rounded-full transition-all" style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              )}

              {/* Division badges */}
              <div className="flex flex-wrap gap-1.5">
                {stats.map(({ div, total, done }) => (
                  <Link key={div.id}
                    href={`/divisions/${div.id}?journee=${j.id}`}
                    className="text-xs px-2 py-0.5 rounded-full font-medium transition hover:scale-105 hover:brightness-125"
                    style={{
                      background: `#${div.color}20`,
                      color: `#${div.color}`,
                      border: `1px solid #${div.color}40`
                    }}>
                    {div.short_name}
                    {done > 0 && <span className="ml-1 opacity-60">{done}/{total}</span>}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
