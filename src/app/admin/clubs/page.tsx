import ClubEditor from '@/components/ClubEditor'
import { CLUB_CATALOG } from '@/lib/clubLogos'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Club, Division } from '@/lib/types'

export const revalidate = 0

export default async function ClubsPage() {
  const sb = getSupabaseAdmin()
  const [{ data: clubs }, { data: divisions }] = await Promise.all([
    sb.from('clubs').select('*').order('id'),
    sb.from('divisions').select('*').order('display_order'),
  ])

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text mb-2">Admin clubs</div>
        <h1 className="interclub-title text-3xl sm:text-5xl font-black uppercase leading-none">Liste des clubs</h1>
        <p className="text-sm text-gray-400 mt-3">
          Choisissez le club officiel: le logo, les terrains et le contact se remplissent automatiquement.
        </p>
      </div>
      <ClubEditor clubs={(clubs ?? []) as Club[]} divisions={(divisions ?? []) as Division[]} catalog={CLUB_CATALOG}/>
    </div>
  )
}
