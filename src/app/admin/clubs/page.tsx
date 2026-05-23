import { getSupabaseAdmin } from '@/lib/supabase'
import ClubEditor from '@/components/ClubEditor'
import type { Club, Division } from '@/lib/types'

export const revalidate = 0

export default async function ClubsPage() {
  const sb = getSupabaseAdmin()
  const [{ data: clubs }, { data: divisions }] = await Promise.all([
    sb.from('clubs').select('*').order('id'),
    sb.from('divisions').select('*').order('display_order'),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Gestion des clubs</h1>
        <p className="text-sm text-gray-400 mt-1">
          Modifiez les noms des clubs par division. Les changements sont appliqués immédiatement.
        </p>
      </div>
      <ClubEditor clubs={(clubs ?? []) as Club[]} divisions={(divisions ?? []) as Division[]}/>
    </div>
  )
}
