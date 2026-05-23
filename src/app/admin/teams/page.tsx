import ClubTeamsEditor from '@/components/ClubTeamsEditor'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Club, ClubPlayer, Division } from '@/lib/types'

export const revalidate = 0

export default async function TeamsPage() {
  const sb = getSupabaseAdmin()
  const [{ data: clubs }, { data: divisions }, { data: players, error: playersError }] = await Promise.all([
    sb.from('clubs').select('*').order('id'),
    sb.from('divisions').select('*').order('display_order'),
    sb.from('club_players').select('*').order('player_order'),
  ])

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text mb-2">
          Admin equipes
        </div>
        <h1 className="interclub-title text-3xl sm:text-5xl font-black uppercase leading-none">
          Clubs & joueurs
        </h1>
        <p className="text-gray-300 text-sm mt-3 max-w-2xl">
          Listes editables par club, poids total automatique et import/export Excel ou CSV.
        </p>
      </div>

      {playersError && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          La table <strong>club_players</strong> n'est pas encore disponible dans Supabase.
          Execute <strong>supabase/003_club_players.sql</strong> dans le SQL Editor, puis reviens sur cette page.
        </div>
      )}

      <ClubTeamsEditor
        clubs={(clubs ?? []) as Club[]}
        divisions={(divisions ?? []) as Division[]}
        initialPlayers={(players ?? []) as ClubPlayer[]}
      />
    </div>
  )
}
