import Link from 'next/link'
import { Clipboard, ShieldCheck, Users } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text mb-2">
          Administration Interclub 2026
        </div>
        <h1 className="interclub-title text-3xl sm:text-5xl font-black uppercase leading-none">
          Every point counts
        </h1>
        <p className="text-gray-300 text-sm mt-3 max-w-2xl">
          Saisie des scores, gestion des clubs et controle des informations officielles du championnat.
        </p>
      </div>

      <div className="glass-panel rounded-xl p-4 flex items-start gap-3 max-w-2xl">
        <ShieldCheck size={22} className="text-cyan shrink-0 mt-0.5"/>
        <div>
          <div className="font-black uppercase text-white">Play up allowed. Play down forbidden.</div>
          <p className="text-sm text-gray-300 mt-1">La regle fondamentale Interclub 2026 doit guider les compositions de joueurs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Link href="/admin/scores"
          className="glass-panel rounded-xl p-6 hover:border-cyan/50 hover:bg-cyan/5 transition group">
          <Clipboard size={28} className="text-cyan mb-3 group-hover:scale-110 transition"/>
          <div className="font-bold text-lg mb-1">Saisir les scores</div>
          <div className="text-sm text-gray-400">Entrer les resultats P1/P2/P3 pour chaque match par journee.</div>
        </Link>
        <Link href="/admin/clubs"
          className="glass-panel rounded-xl p-6 hover:border-cyan/50 hover:bg-cyan/5 transition group">
          <Users size={28} className="text-cyan mb-3 group-hover:scale-110 transition"/>
          <div className="font-bold text-lg mb-1">Gerer les clubs</div>
          <div className="text-sm text-gray-400">Modifier les noms et abreviations des clubs par division.</div>
        </Link>
      </div>
    </div>
  )
}
