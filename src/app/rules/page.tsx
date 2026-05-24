import { AlertTriangle, CalendarDays, ClipboardCheck, Crown, Gavel, Radio, ShieldCheck, Trophy, Users } from 'lucide-react'

const divisionPyramid = [
  { level: 'MASTERS', men: 'D1 HOMMES - 8 equipes', women: 'D1 DAMES - 4 equipes', ranking: 'M1000', format: 'Format A' },
  { level: 'CHALLENGER', men: 'D2 HOMMES - 5 equipes', women: 'D2 DAMES - 4 equipes', ranking: 'M500', format: 'Format B' },
  { level: 'OPEN', men: 'D3 HOMMES - 6 equipes', women: 'D3 DAMES - 5 equipes', ranking: 'M250', format: 'Format B / C' },
  { level: 'RISING', men: 'D4 HOMMES - 6 equipes', women: '-', ranking: 'M100', format: 'Format C' },
]

const keyDates = [
  ['31 juillet 2026', 'Cloture inscriptions et paiement'],
  ['31 aout 2026', 'Rattachement joueurs'],
  ['7 septembre 2026', 'Validation finale des feuilles equipe'],
  ['12 septembre 2026', 'Reunion Capitaines'],
  ['18 septembre 2026', 'J1 - Coup d envoi'],
  ['16 avril 2027', 'Grande finale D1 HOMMES Masters'],
  ['21 mai 2027', 'Finale D2 HOMMES et cloture saison'],
]

const cards = [
  {
    icon: Trophy,
    title: 'Structure sportive',
    items: [
      '7 divisions officielles: 4 Hommes et 3 Dames.',
      'D1 HOMMES: 2 poules de 4, phase aller-retour, demi-finales puis finale.',
      'D1 DAMES: aller-retour complet puis finale.',
      'D2 a D4: formats adaptes selon nombre d equipes et niveau competitif.',
    ],
  },
  {
    icon: Users,
    title: 'Equipes et eligibilite',
    items: [
      'Maximum 1 equipe par club et par division.',
      'Minimum 6 joueurs pour jouer, maximum 9 joueurs sur feuille de match.',
      'Statuts officiels: EQ, NvEQ, INVIT.',
      'Sans validation club + joueur, le joueur ne peut pas participer.',
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Composition des paires',
    items: [
      '3 paires obligatoires: P1, P2, P3.',
      'Regle poids cumule: P1 <= P2 <= P3.',
      'Poids faible = paire forte; poids eleve = paire plus accessible.',
      'Un joueur NC est obligatoirement positionne en P3.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Mobilite multi-equipes',
    items: [
      'Play up allowed. Play down forbidden.',
      'Apres 2 rencontres en division superieure, un joueur ne peut plus redescendre.',
      'Restriction definitive pour la saison.',
      'Derogation uniquement par Commission Technique.',
    ],
  },
  {
    icon: CalendarDays,
    title: 'Calendrier officiel',
    items: [
      'J1 a J9, du 18 septembre 2026 au 21 mai 2027.',
      'Creneau fixe: 3e vendredi de chaque mois.',
      'Report ou delocalisation a jouer sous 14 jours.',
      'Accord Commission obligatoire pour tout changement de date.',
    ],
  },
  {
    icon: Gavel,
    title: 'Resultats et sanctions',
    items: [
      'Feuille de match signee et soumise dans les 24h.',
      'Homologation MPL sous 48h apres chaque journee.',
      'Retard de paire superieur a 15 min = forfait de paire.',
      'Litige tranche par la Commission Technique sous 72h.',
    ],
  },
]

const formats = [
  ['Format A', 'D1 HOMMES / D1 DAMES', '2 sets de 6 jeux + Golden TieBreak a 1 set partout'],
  ['Format B', 'D2 HOMMES / D2 DAMES / D3 HOMMES', '2 sets de 6 jeux + Golden TieBreak'],
  ['Format C', 'D4 HOMMES / D3 DAMES', '2 sets de 4 jeux + Golden TieBreak'],
]

const rankingPoints = [
  ['MASTERS', 'M1000', 'Champion 1000 pts', 'Finaliste 600 pts', 'Demi-finaliste 300 pts'],
  ['CHALLENGER', 'M500', 'Champion 500 pts', 'Finaliste 300 pts', 'Demi-finaliste 150 pts'],
  ['OPEN', 'M250', 'Champion 250 pts', 'Finaliste 150 pts', 'Demi-finaliste 75 pts'],
  ['RISING', 'M100', 'Champion 100 pts', 'Finaliste 60 pts', 'Demi-finaliste 20 pts'],
]

export default function RulesPage() {
  return (
    <div className="space-y-7">
      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-x-0 bottom-0 h-px bg-cyan/70 shadow-[0_0_30px_rgba(1,208,251,0.9)]" />
          <div className="max-w-4xl">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text">
              Cahier des charges officiel v3.0
            </div>
            <h1 className="interclub-title text-3xl font-black uppercase leading-none sm:text-5xl">
              Reglement Interclub 2026
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-300">
              Synthese premium du CDC v3: structure sportive, obligations des clubs,
              formats de match, calendrier, resultats et points ranking. Le document complet reste la reference officielle.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {divisionPyramid.map(row => (
          <div key={row.level} className="rounded-xl border border-cyan/20 bg-black/25 p-4 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <Crown size={18} className="text-cyan" />
              <h2 className="font-black uppercase text-white">{row.level}</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">{row.men}</div>
              <div className="text-gray-300">{row.women}</div>
              <div className="pt-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan">{row.ranking} - {row.format}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {cards.map(({ icon: Icon, title, items }) => (
          <div key={title} className="glass-panel rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Icon size={20} className="text-cyan" />
              <h2 className="font-black uppercase text-white">{title}</h2>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              {items.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Radio size={20} className="text-cyan" />
          <h2 className="font-black uppercase text-white">Formats de match</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {formats.map(([format, divisions, rule]) => (
            <div key={format} className="rounded-lg border border-cyan/20 bg-cyan/10 p-3 text-sm">
              <div className="font-black text-cyan">{format}</div>
              <div className="mt-1 font-semibold text-white">{divisions}</div>
              <div className="mt-2 text-gray-300">{rule}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={20} className="text-cyan" />
            <h2 className="font-black uppercase text-white">Dates cles</h2>
          </div>
          <div className="divide-y divide-white/5">
            {keyDates.map(([date, event]) => (
              <div key={date} className="grid grid-cols-[130px_1fr] gap-3 py-2 text-sm">
                <div className="font-bold text-cyan">{date}</div>
                <div className="text-gray-300">{event}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-cyan" />
            <h2 className="font-black uppercase text-white">Departage et ranking</h2>
          </div>
          <div className="mb-4 text-sm text-gray-300">
            Departage: victoires, paires gagnees, difference de sets, difference de jeux,
            confrontation directe, barrage officiel, puis tirage Commission en dernier recours.
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            {rankingPoints.map(([division, equivalent, champion, finalist, semi]) => (
              <div key={division} className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="font-black text-cyan">{division} - {equivalent}</div>
                <div className="mt-1 text-gray-300">{champion}</div>
                <div className="text-gray-400">{finalist}</div>
                <div className="text-gray-500">{semi}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
