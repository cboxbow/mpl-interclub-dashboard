import ClubEditor from '@/components/ClubEditor'
import { CLUB_CATALOG } from '@/lib/clubLogos'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Club, Division } from '@/lib/types'

export const revalidate = 0

export default async function ClubsPage() {
  const sb = getSupabaseAdmin()
  const [{ data: clubs }, { data: divisions }, detailsCheck] = await Promise.all([
    sb.from('clubs').select('*').order('id'),
    sb.from('divisions').select('*').order('display_order'),
    sb.from('clubs').select('venue_details,contact_name,contact_phone,contact_email').limit(1),
  ])

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text mb-2">Admin clubs</div>
        <h1 className="interclub-title text-3xl sm:text-5xl font-black uppercase leading-none">Liste des clubs</h1>
        <p className="text-sm text-gray-400 mt-3">
          Gere les equipes par division. Un meme club officiel peut etre ajoute en D1H, D2H ou dans plusieurs divisions femmes.
        </p>
      </div>
      {detailsCheck.error && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Les colonnes terrain/contact ne sont pas encore disponibles dans Supabase.
          Execute <strong>supabase/005_club_details.sql</strong> dans le SQL Editor, puis recharge la page.
        </div>
      )}
      <ClubEditor clubs={(clubs ?? []) as Club[]} divisions={(divisions ?? []) as Division[]} catalog={CLUB_CATALOG}/>
    </div>
  )
}
