import { AlertTriangle, CalendarDays, ClipboardCheck, Trophy, Users } from 'lucide-react'

const sections = [
  {
    icon: Trophy,
    title: 'Structure sportive',
    items: [
      '7 divisions: D1H, D2H, D3H, D4H, D1F, D2F, D3F Open.',
      'D1H et D1F en aller-retour; divisions inferieures en aller simple selon le CDC.',
      'Promotions et relegations en fin de saison selon classement final.',
    ],
  },
  {
    icon: Users,
    title: 'Equipes et joueurs',
    items: [
      'Minimum 6 joueurs pour jouer, maximum 9 joueurs sur la feuille de match.',
      'Statuts officiels: EQ, NvEQ, INVIT.',
      'Rattachement joueurs a valider avant le 31 aout 2026.',
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Feuille de match',
    items: [
      '3 paires obligatoires: P1, P2, P3.',
      'Ordre des paires par rang MPL: P1 = meilleurs classes.',
      'Joueur non classe obligatoirement en P3.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Regle multi-equipes',
    items: [
      'Play up allowed. Play down forbidden.',
      'Un joueur ayant joue 2 rencontres ou plus en division superieure ne peut plus descendre.',
      'Derogation uniquement par Commission Technique MPL.',
    ],
  },
  {
    icon: CalendarDays,
    title: 'Calendrier et resultats',
    items: [
      'Journees le 3e vendredi de chaque mois.',
      'Resultats a soumettre dans les 24h.',
      'Homologation MPL sous 48h apres chaque journee.',
    ],
  },
]

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text mb-2">
          Cahier des charges v2.0
        </div>
        <h1 className="interclub-title text-3xl sm:text-5xl font-black uppercase leading-none">
          Reglement Interclub 2026
        </h1>
        <p className="text-gray-300 text-sm mt-3 max-w-3xl">
          Synthese operationnelle des points principaux du CDC officiel MPL / MSRA pour les clubs,
          capitaines, joueurs et administrateurs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map(({ icon: Icon, title, items }) => (
          <section key={title} className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={20} className="text-cyan"/>
              <h2 className="font-black uppercase text-white">{title}</h2>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              {items.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan shrink-0"/>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="glass-panel rounded-xl p-5">
        <h2 className="font-black uppercase text-white mb-3">Barème classement CDC</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-cyan/20 bg-cyan/10 p-3">
            <div className="font-bold text-cyan">Victoire 3-0</div>
            <div className="text-gray-300">3 pts vainqueur / 0 pt perdant</div>
          </div>
          <div className="rounded-lg border border-cyan/20 bg-cyan/10 p-3">
            <div className="font-bold text-cyan">Victoire 2-1</div>
            <div className="text-gray-300">2 pts vainqueur / 1 pt perdant</div>
          </div>
          <div className="rounded-lg border border-cyan/20 bg-cyan/10 p-3">
            <div className="font-bold text-cyan">Departage</div>
            <div className="text-gray-300">PTS, victoires, paires, sets, jeux, confrontation directe</div>
          </div>
        </div>
      </div>
    </div>
  )
}
