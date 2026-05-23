import Link from 'next/link'
import { Users, Clipboard } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Administration</h1>
      <p className="text-gray-400 text-sm">Saisie des scores et gestion des clubs pour le MPL Interclub Championship 2026.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Link href="/admin/scores"
          className="bg-navy-800/60 border border-cyan/20 rounded-xl p-6 hover:border-cyan/50 hover:bg-cyan/5 transition group">
          <Clipboard size={28} className="text-cyan mb-3 group-hover:scale-110 transition"/>
          <div className="font-bold text-lg mb-1">Saisir les scores</div>
          <div className="text-sm text-gray-400">Entrer les résultats P1/P2/P3 pour chaque match par journée</div>
        </Link>
        <Link href="/admin/clubs"
          className="bg-navy-800/60 border border-white/10 rounded-xl p-6 hover:border-cyan/30 hover:bg-white/5 transition group">
          <Users size={28} className="text-cyan mb-3 group-hover:scale-110 transition"/>
          <div className="font-bold text-lg mb-1">Gérer les clubs</div>
          <div className="text-sm text-gray-400">Modifier les noms et abréviations des clubs par division</div>
        </Link>
      </div>
    </div>
  )
}
