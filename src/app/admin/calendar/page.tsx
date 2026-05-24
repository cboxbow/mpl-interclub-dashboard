import JourneesEditor from '@/components/JourneesEditor'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Journee } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminCalendarPage() {
  const sb = getSupabaseAdmin()
  const { data: journees } = await sb.from('journees').select('*').order('number')

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text">
          Administration calendrier
        </div>
        <h1 className="interclub-title mt-2 text-3xl font-black uppercase leading-none sm:text-5xl">
          Dates des tournois
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-300">
          Modifie les journees une par une, importe un calendrier Excel/CSV, exporte la base actuelle ou remets le calendrier a zero.
        </p>
      </div>

      <JourneesEditor journees={(journees ?? []) as Journee[]} />
    </div>
  )
}
