import { getSupabaseAdmin } from '@/lib/supabase'
import type { Division, Standing, Match, Journee } from '@/lib/types'
import StandingsTable from '@/components/StandingsTable'
import MatchCard from '@/components/MatchCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 30

interface Props {
  params: { id: string }
  searchParams?: { journee?: string }
}

export default async function DivisionPage({ params, searchParams }: Props) {
  const divId = parseInt(params.id)
  const selectedJourneeId = searchParams?.journee ? Number(searchParams.journee) : null
  const sb = getSupabaseAdmin()

  const [{ data: div }, { data: standings }, { data: matches }, { data: journees }] = await Promise.all([
    sb.from('divisions').select('*').eq('id', divId).single(),
    sb.from('standings').select('*').eq('division_id', divId).order('rank'),
    sb.from('matches').select('*, home_club:clubs!matches_home_club_id_fkey(*), away_club:clubs!matches_away_club_id_fkey(*), journee:journees(*), pairs:match_pairs(*)')
      .eq('division_id', divId).order('journee_id'),
    sb.from('journees').select('*').order('number'),
  ])

  if (!div) return notFound()

  // Group matches by journée
  const byJournee: Record<number, Match[]> = {}
  ;(matches ?? []).forEach((m: Match) => {
    if (!byJournee[m.journee_id]) byJournee[m.journee_id] = []
    byJournee[m.journee_id].push(m)
  })

  const jList = (journees ?? [])
    .filter((j: Journee) => byJournee[j.id]?.length)
    .filter((j: Journee) => !selectedJourneeId || j.id === selectedJourneeId)
  const selectedJournee = selectedJourneeId
    ? (journees ?? []).find((j: Journee) => j.id === selectedJourneeId)
    : null

  return (
    <div className="space-y-6">
      <Link href={selectedJourneeId ? '/calendar' : '/'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-cyan transition">
        <ArrowLeft size={14}/> Retour {selectedJourneeId ? 'au calendrier' : 'au dashboard'}
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full" style={{ background: `#${(div as Division).color}` }}/>
        <h1 className="text-2xl font-bold text-white">{(div as Division).name}</h1>
        <span className="text-sm text-gray-500">
          {(div as Division).n_clubs} clubs - {(div as Division).format} - {selectedJournee ? `J${selectedJournee.number} seulement` : `${matches?.length ?? 0} matchs`}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        {/* Left: Standings */}
        <div className="bg-navy-800/40 rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 font-semibold text-sm">
            Classement
          </div>
          <StandingsTable standings={(standings ?? []) as Standing[]} />
        </div>

        {/* Right: Schedule */}
        <div className="bg-navy-800/40 rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 font-semibold text-sm">Calendrier</div>
          <div className="overflow-y-auto max-h-[600px] scrollbar-hidden divide-y divide-white/5">
            {jList.map((j: Journee) => (
              <div key={j.id}>
                <div className="px-4 py-2 bg-navy/60 text-xs text-cyan font-bold sticky top-0">
                  J{j.number} — {j.label}
                </div>
                <div className="p-3 space-y-2">
                  {(byJournee[j.id] ?? []).map((m: Match) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
