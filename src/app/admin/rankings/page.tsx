import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { PlayerRanking } from '@/lib/types'
import fallbackRankings from '@/data/playerRankings.json'
import { Database, Download, Trophy } from 'lucide-react'

export const revalidate = 0

const asRankings = (rows: unknown): PlayerRanking[] => rows as PlayerRanking[]

function RankingTable({ title, rows }: { title: string; rows: PlayerRanking[] }) {
  return (
    <section className="glass-panel overflow-hidden rounded-xl">
      <div className="flex flex-col gap-1 border-b border-cyan/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black uppercase text-white">{title}</h2>
          <div className="text-xs text-gray-500">{rows.length} joueurs</div>
        </div>
        <div className="text-xs text-cyan">Club et telephone relies depuis Excel</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-cyan/10 text-xs uppercase text-cyan">
            <tr>
              <th className="px-3 py-2 text-left">Rang</th>
              <th className="px-3 py-2 text-left">Joueur</th>
              <th className="px-3 py-2 text-right">Points</th>
              <th className="px-3 py-2 text-left">Club</th>
              <th className="px-3 py-2 text-left">Tel</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Niveau</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, index) => (
              <tr key={`${row.gender}-${row.player_name}-${index}`} className="hover:bg-white/5">
                <td className="px-3 py-2 font-black text-white">{row.rank ?? '-'}</td>
                <td className="px-3 py-2 font-bold text-white">{row.player_name}</td>
                <td className="px-3 py-2 text-right font-bold text-cyan">{Number(row.total_points ?? 0).toLocaleString('fr-FR')}</td>
                <td className="px-3 py-2 text-gray-300">{row.club_name || row.source_club_name || '-'}</td>
                <td className="px-3 py-2 text-gray-300">{row.mobile || '-'}</td>
                <td className="px-3 py-2 text-gray-400">{row.email || '-'}</td>
                <td className="px-3 py-2 text-gray-400">{row.level || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

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

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/teams" className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-gray-200 hover:bg-white/10">
          <Download size={14}/> Utiliser pour les equipes
        </Link>
      </div>

      <RankingTable title="Classement Hommes" rows={men} />
      <RankingTable title="Classement Dames" rows={women} />
    </div>
  )
}
