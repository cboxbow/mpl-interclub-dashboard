import { getSupabaseAdmin } from '@/lib/supabase'
import type { Division, Standing, Journee } from '@/lib/types'
import StandingsTable from '@/components/StandingsTable'
import Countdown from '@/components/Countdown'
import Link from 'next/link'
import { Calendar, ChevronRight, ShieldCheck, Trophy, Users } from 'lucide-react'

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
    sb.from('journees').select('*').order('number'),
  ])

  const standingsByDiv: Record<number, Standing[]> = {}
  ;(allStandings ?? []).forEach((s: Standing) => {
    if (!standingsByDiv[s.division_id]) standingsByDiv[s.division_id] = []
    standingsByDiv[s.division_id].push(s)
  })

  const nextJournee = (journees ?? []).find((j: Journee) => j.status !== 'completed')
  const upcomingJournees = (journees ?? []).filter((j: Journee) => j.status !== 'completed').slice(0, 3)
  const campaignClubCount = 18
  const nextDate = nextJournee ? new Date(nextJournee.date) : null

  return (
    <div className="space-y-8">
      <section className="relative -mx-4 -mt-6 min-h-[calc(100vh-88px)] overflow-hidden border-b border-cyan/20 bg-black sm:rounded-b-[2rem]">
        <img
          src="/interclub-2026-hero.gif"
          alt="Interclub 2026 Mauritius Padel League"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,4,16,0.76)_0%,rgba(0,4,16,0.26)_42%,rgba(0,4,16,0.20)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,4,16,0.08)_0%,rgba(0,4,16,0.08)_46%,rgba(0,4,16,0.88)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-cyan/70 shadow-[0_0_32px_rgba(1,208,251,0.95)]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col justify-end px-4 pb-6 pt-28 sm:px-6 lg:px-8">
          <div className="grid items-end gap-6 lg:grid-cols-[1fr_360px]">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex border-l-2 border-cyan pl-4 text-xs font-black uppercase tracking-[0.34em] interclub-blue-text">
                One island. {campaignClubCount} clubs. 1 identity.
              </div>
              <p className="max-w-2xl text-xl font-black uppercase leading-tight tracking-[0.16em] text-white drop-shadow-[0_0_20px_rgba(1,208,251,0.55)] sm:text-3xl">
                L'ile Maurice entre dans son championnat interclubs.
              </p>
              <p className="mt-4 max-w-2xl text-sm font-bold uppercase tracking-[0.18em] text-cyan sm:text-base">
                Every club. Every player. Every point counts.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-200 sm:text-base">
                Le championnat qui rassemble les clubs de l'ile Maurice dans une meme identite sportive:
                du terrain local au classement national, chaque match compte.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/calendar" className="inline-flex items-center gap-2 rounded-md bg-cyan px-4 py-3 text-sm font-black uppercase text-navy shadow-[0_0_28px_rgba(1,208,251,0.45)] transition hover:bg-white">
                  <Calendar size={17}/> Calendrier
                </Link>
                <Link href="/teams" className="inline-flex items-center gap-2 rounded-md border border-cyan/50 bg-black/25 px-4 py-3 text-sm font-bold uppercase text-cyan backdrop-blur transition hover:bg-cyan/10">
                  <Users size={17}/> Equipes
                </Link>
                <Link href="/admin/rankings" className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/25 px-4 py-3 text-sm font-bold uppercase text-white backdrop-blur transition hover:border-cyan/60 hover:text-cyan">
                  <Trophy size={17}/> Classements
                </Link>
              </div>
            </div>

            {nextJournee && (
              <div className="rounded-xl border border-cyan/30 bg-black/35 p-4 shadow-[0_0_34px_rgba(1,208,251,0.16)] backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan">
                  <Calendar size={15}/> Prochaine journee
                </div>
                <Countdown date={nextJournee.date} label={`J${nextJournee.number} - ${nextJournee.label}`} />
                {nextDate && (
                  <div className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-gray-400">
                    {nextDate.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-cyan/20 bg-cyan/20 sm:grid-cols-4">
            <div className="bg-black/45 p-3 backdrop-blur">
              <div className="text-2xl font-black text-white">{campaignClubCount}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-cyan">Clubs</div>
            </div>
            <div className="bg-black/45 p-3 backdrop-blur">
              <div className="text-2xl font-black text-white">{divisions?.length ?? 0}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-cyan">Divisions</div>
            </div>
            <div className="bg-black/45 p-3 backdrop-blur">
              <div className="text-2xl font-black text-white">2026</div>
              <div className="text-xs uppercase tracking-[0.18em] text-cyan">Saison 1</div>
            </div>
            <div className="bg-black/45 p-3 backdrop-blur">
              <div className="text-2xl font-black text-white">MPL</div>
              <div className="text-xs uppercase tracking-[0.18em] text-cyan">Officiel</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-xl p-4">
          <Users size={22} className="mb-3 text-cyan"/>
          <div className="font-black uppercase text-white">18 clubs, une ile</div>
          <p className="mt-1 text-sm text-gray-300">Chaque club peut exister dans plusieurs divisions, avec ses joueurs et son ranking.</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <Trophy size={22} className="mb-3 text-cyan"/>
          <div className="font-black uppercase text-white">Every point counts</div>
          <p className="mt-1 text-sm text-gray-300">PTS, paires, sets et jeux departagent les clubs jusqu'au dernier match.</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <ShieldCheck size={22} className="mb-3 text-cyan"/>
          <div className="font-black uppercase text-white">Play up allowed</div>
          <p className="mt-1 text-sm text-gray-300">Play down forbidden: la regle fondamentale Interclub 2026 reste visible.</p>
        </div>
      </div>

      {upcomingJournees.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text">
                Suivre la competition
              </div>
              <h2 className="interclub-title mt-1 text-2xl font-black uppercase sm:text-4xl">
                Prochaines journees
              </h2>
            </div>
            <Link href="/calendar" className="inline-flex items-center gap-1 text-sm font-bold text-cyan hover:text-white">
              Calendrier complet <ChevronRight size={16}/>
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {upcomingJournees.map((journee: Journee) => (
              <Link key={journee.id} href="/calendar" className="rounded-xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan/50 hover:bg-cyan/5">
                <div className="text-lg font-black text-cyan">J{journee.number}</div>
                <div className="mt-1 font-bold text-white">{journee.label}</div>
                <div className="mt-2 text-sm text-gray-400">
                  {new Date(journee.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(divisions ?? []).map((div: Division) => {
          const standings = (standingsByDiv[div.id] ?? []).slice(0, 4)
          const borderCls = DIV_COLORS[div.color] ?? 'border-white/10 bg-white/5'
          return (
            <div key={div.id} className={`rounded-xl border overflow-hidden ${borderCls}`}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: `1px solid #${div.color}30` }}>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: `#${div.color}` }}/>
                  <span className="text-sm font-bold">{div.name}</span>
                  <span className="text-xs text-gray-500">{div.n_clubs} clubs</span>
                </div>
                <Link href={`/divisions/${div.id}`}
                  className="flex items-center gap-0.5 text-xs text-gray-500 transition hover:text-cyan">
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
