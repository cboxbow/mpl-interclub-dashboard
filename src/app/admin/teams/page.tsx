import ClubTeamsEditor from '@/components/ClubTeamsEditor'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Club, ClubPlayer, Division, PlayerRanking } from '@/lib/types'

export const revalidate = 0

export default async function TeamsPage() {
  const sb = getSupabaseAdmin()
  const [{ data: clubs }, { data: divisions }, { data: players, error: playersError }, { data: rankings }, playerDetailsCheck, rankingLinkCheck] = await Promise.all([
    sb.from('clubs').select('*').order('id'),
    sb.from('divisions').select('*').order('display_order'),
    sb.from('club_players').select('*').order('player_order'),
    sb.from('player_rankings').select('id,gender,rank,player_name,total_points,club_name,source_club_name,mobile,email,level,source').order('gender').order('rank'),
    sb.from('club_players').select('player_status,is_unranked,player_confirmed,club_validated,license_number,category,phone,email,notes').limit(1),
    sb.from('club_players').select('ranking_points,ranking_gender,ranking_source_id,ranking_source_club').limit(1),
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

      {!playersError && playerDetailsCheck.error && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Les colonnes details joueurs ne sont pas encore disponibles dans Supabase.
          Re-execute <strong>supabase/003_club_players.sql</strong> dans le SQL Editor, puis recharge la page.
        </div>
      )}

      {!playersError && !playerDetailsCheck.error && rankingLinkCheck.error && (
        <div className="rounded-xl border border-cyan/30 bg-cyan/10 p-4 text-sm text-cyan">
          L'autoremplissage fonctionne deja. Pour sauvegarder aussi les points et la source ranking en colonnes dediees,
          execute <strong>supabase/012_club_players_ranking_link.sql</strong> dans Supabase.
        </div>
      )}

      <ClubTeamsEditor
        clubs={(clubs ?? []) as Club[]}
        divisions={(divisions ?? []) as Division[]}
        initialPlayers={(players ?? []) as ClubPlayer[]}
        rankings={(rankings ?? []) as PlayerRanking[]}
        supportsRankingLink={!rankingLinkCheck.error}
      />
    </div>
  )
}
