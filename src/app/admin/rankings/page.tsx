import { getSupabaseAdmin } from '@/lib/supabase'
import type { PlayerRanking } from '@/lib/types'
import fallbackRankings from '@/data/playerRankings.json'
import RankingsEditor from '@/components/RankingsEditor'
import { Database, Trophy } from 'lucide-react'

export const revalidate = 0

const asRankings = (rows: unknown): PlayerRanking[] => rows as PlayerRanking[]

export default async function AdminRankingsPage() {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('player_rankings')
    .select('*')
    .order('gender')
    .order('rank')
    .order('player_name')

  const rows = error ? asRankings(fallbackRankings) : ((data ?? []) as PlayerRanking[])
  const men = rows.filter(row => row.gender === 'H').sort((a, b) => (a.rank ?? 99999) - (b.rank ?? 99999))
  const women = rows.filter(row => row.gender === 'F').sort((a, b) => (a.rank ?? 99999) - (b.rank ?? 99999))
  const missingClub = rows.filter(row => !row.club_name && !row.source_club_name).length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text">
          <Trophy size={18}/> Admin classements
        </div>
        <h1 className="interclub-title text-3xl font-black uppercase leading-none sm:text-5xl">Hommes & Dames</h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-300">
          Classements importes depuis le fichier rankings, relies aux clubs et numeros de telephone du fichier joueurs clubs.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-cyan">{men.length} hommes</span>
          <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-cyan">{women.length} dames</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-gray-300">{missingClub} sans club trouve</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <div className="flex items-start gap-2">
            <Database size={18} className="mt-0.5 shrink-0"/>
            <div>
              La table Supabase <strong>player_rankings</strong> n'existe pas encore. Cette page affiche le fichier local genere.
              Execute <strong>supabase/008_player_rankings.sql</strong>, puis lance <strong>node scripts/import-rankings.cjs --supabase</strong>.
            </div>
          </div>
        </div>
      )}

      <RankingsEditor initialRows={[...men, ...women]} />
    </div>
  )
}
