import Image from 'next/image'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Club, ClubPlayer, Division } from '@/lib/types'
import { ListChecks, Trophy, UsersRound } from 'lucide-react'
import { CLUB_CATALOG } from '@/lib/clubLogos'

export const revalidate = 60

const normalizeClubName = (name: string) =>
  name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, ' ')

const catalogByName = new Map(CLUB_CATALOG.map(club => [club.name, club]))
const catalogByNormalizedName = new Map(CLUB_CATALOG.map(club => [normalizeClubName(club.name), club.name]))

const canonicalClubName = (name: string) => {
  const normalized = normalizeClubName(name)
  const exact = catalogByNormalizedName.get(normalized)
  if (exact) return exact
  if (normalized.includes('CANA')) return 'Cana Beau Plan'
  if (normalized.includes('CLUB HOUSE') || normalized.includes('TAMARIN HOUSE')) return 'Club House Black River'
  if (normalized.includes('CLUB MED')) return 'Club Med Albion'
  if (normalized.includes('ENERGIA')) return 'Energia Pointe aux Canonniers'
  if (normalized.includes('SPARC')) return 'SPARC Cascavelle'
  if (normalized.includes('LABOUR')) return 'Labourdonnais Mapou'
  if (normalized.includes('ISLA')) return 'Isla Padel Grand Baie'
  if (normalized.includes('TERRES')) return 'Terres Brunes Sports & Leisure'
  if (normalized.includes('MONT')) return 'Mont Choisy Golf'
  if (normalized.includes('OXYGEN')) return 'Oxygen Moka'
  if (normalized.includes('MOKA RANGER')) return 'Moka Rangers'
  if (normalized.includes('STUDIO')) return 'Studio by RM Azuri'
  if (normalized.includes('PORT CHAMBLY')) return 'I Padel by RM Port Chambly'
  if (normalized.includes('IPADEL') || normalized.includes('I PADEL')) return 'I Padel by RM Hennessy'
  if (normalized.includes('RM TAM')) return 'RM Club Tamarin'
  if (normalized.includes('RM GRAND') || normalized.includes('RN1') || normalized.includes('FORBACH')) return 'RM Club Forbach'
  if (normalized.includes('URBAN')) return 'Urban Sport Grand Baie'
  return name
}

export default async function TeamsPublicPage() {
  const sb = getSupabaseAdmin()
  const [{ data: clubs }, { data: divisions }, { data: players }] = await Promise.all([
    sb.from('clubs').select('*').order('name'),
    sb.from('divisions').select('*').order('display_order'),
    sb.from('club_players').select('club_id,last_name,first_name,ranking,player_order').order('player_order'),
  ])

  const divisionById = new Map(((divisions ?? []) as Division[]).map(div => [div.id, div]))
  const playersByClub = new Map<number, ClubPlayer[]>()
  ;((players ?? []) as ClubPlayer[]).forEach(player => {
    if (!playersByClub.has(player.club_id)) playersByClub.set(player.club_id, [])
    playersByClub.get(player.club_id)?.push(player)
  })

  const grouped = new Map<string, Club[]>()
  ;((clubs ?? []) as Club[]).forEach(club => {
    if (/^Club [A-Z] \(D\d[HF]\)$/.test(club.name)) return
    const canonical = canonicalClubName(club.name)
    if (!grouped.has(canonical)) grouped.set(canonical, [])
    grouped.get(canonical)?.push(club)
  })

  const groupedEntries = [...grouped.entries()]
    .map(([clubName, entries]) => {
      const bestByDivision = new Map<number, Club>()
      entries.forEach(entry => {
        const current = bestByDivision.get(entry.division_id)
        const entryRoster = playersByClub.get(entry.id)?.length ?? 0
        const currentRoster = current ? (playersByClub.get(current.id)?.length ?? 0) : -1
        if (!current || entryRoster > currentRoster || entry.name === clubName) bestByDivision.set(entry.division_id, entry)
      })
      return [clubName, [...bestByDivision.values()].sort((a, b) => {
        const divA = divisionById.get(a.division_id)?.display_order ?? 999
        const divB = divisionById.get(b.division_id)?.display_order ?? 999
        return divA - divB
      })] as const
    })
    .sort(([a], [b]) => a.localeCompare(b))
  const officialClubCount = groupedEntries.length
  const divisionEntriesCount = groupedEntries.reduce((sum, [, entries]) => sum + entries.length, 0)
  const filledPlayersCount = [...playersByClub.values()].reduce(
    (sum, roster) => sum + roster.filter(player => player.last_name || player.first_name || player.ranking !== null).length,
    0
  )

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="relative -mx-4 -mt-6 min-h-[72vh] overflow-hidden border-b border-cyan/20 bg-black sm:rounded-b-[2rem]">
        <img
          src="/interclub-teams-hero.gif"
          alt="Every club every player every point counts"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,4,16,0.02)_0%,rgba(0,4,16,0.04)_46%,rgba(0,4,16,0.78)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,4,16,0.50)_0%,rgba(0,4,16,0.10)_46%,rgba(0,4,16,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-cyan/70 shadow-[0_0_34px_rgba(1,208,251,0.95)]" />

        <div className="relative z-10 flex min-h-[72vh] flex-col justify-end px-4 pb-8 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-xl border-l-2 border-cyan bg-black/28 py-4 pl-4 pr-5 backdrop-blur-sm">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] interclub-blue-text">
              <UsersRound size={17}/> Equipes Interclub
            </div>
            <h1 className="text-2xl font-black uppercase leading-none text-white drop-shadow-[0_0_18px_rgba(1,208,251,0.45)] sm:text-4xl">
              Clubs & equipes
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-200 sm:text-base">
              Les clubs engages, leurs divisions et leurs compositions, reunis dans une lecture claire pour suivre la competition.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-cyan/20 bg-cyan/20 sm:grid-cols-3">
        <div className="bg-black/45 p-4 backdrop-blur">
          <div className="text-3xl font-black text-white">{officialClubCount}</div>
          <div className="text-xs uppercase tracking-[0.18em] text-cyan">Clubs engages</div>
        </div>
        <div className="bg-black/45 p-4 backdrop-blur">
          <div className="text-3xl font-black text-white">{divisionEntriesCount}</div>
          <div className="text-xs uppercase tracking-[0.18em] text-cyan">Equipes en division</div>
        </div>
        <div className="bg-black/45 p-4 backdrop-blur">
          <div className="text-3xl font-black text-white">{filledPlayersCount}</div>
          <div className="text-xs uppercase tracking-[0.18em] text-cyan">Joueurs inscrits</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-xl p-4">
          <UsersRound size={22} className="mb-3 text-cyan"/>
          <div className="font-black uppercase text-white">Identite club</div>
          <p className="mt-1 text-sm text-gray-300">Chaque club est regroupe sous son identite officielle, meme lorsqu'il joue plusieurs divisions.</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <ListChecks size={22} className="mb-3 text-cyan"/>
          <div className="font-black uppercase text-white">Equipes par division</div>
          <p className="mt-1 text-sm text-gray-300">Les compositions se lisent directement sous chaque division pour comparer les forces en presence.</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <Trophy size={22} className="mb-3 text-cyan"/>
          <div className="font-black uppercase text-white">Lecture sportive</div>
          <p className="mt-1 text-sm text-gray-300">Les rankings donnent un repere rapide avant les premiers resultats de la saison.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groupedEntries.map(([clubName, entries]) => {
          const catalog = catalogByName.get(clubName)
          const logoUrl = catalog?.logoUrl || entries.find(entry => entry.logo_url)?.logo_url
          return (
          <section key={clubName} className="group overflow-hidden rounded-xl border border-cyan/20 bg-[linear-gradient(135deg,rgba(1,15,39,0.90),rgba(0,22,76,0.42))] shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:border-cyan/45 hover:shadow-[0_0_40px_rgba(1,208,251,0.13)]">
            <div className="flex items-center gap-3 border-b border-cyan/20 bg-black/18 px-4 py-4">
              <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                {logoUrl ? (
                  <Image src={logoUrl} alt={clubName} width={76} height={58} className="max-h-14 w-auto object-contain"/>
                ) : (
                  <span className="text-[10px] text-gray-600">Logo</span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-black uppercase text-white drop-shadow-[0_0_12px_rgba(1,208,251,0.35)]">{clubName}</h2>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                  <span>{entries.length} division{entries.length > 1 ? 's' : ''}</span>
                  {catalog && <span className="text-cyan/80">{catalog.location} - {catalog.zone}</span>}
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {entries.map(entry => {
                const division = divisionById.get(entry.division_id)
                const roster = (playersByClub.get(entry.id) ?? [])
                  .filter(player => player.last_name || player.first_name || player.ranking !== null)
                return (
                  <div key={entry.id} className="p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-bold text-cyan">{division?.name ?? 'Division'}</div>
                      <div className="text-xs text-gray-500">{roster.length} joueur{roster.length > 1 ? 's' : ''}</div>
                    </div>
                    {roster.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-xs uppercase text-gray-500">
                            <tr>
                              <th className="py-1 text-left">Nom</th>
                              <th className="py-1 text-left">Prenom</th>
                              <th className="py-1 text-right">Ranking</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {roster.map((player, index) => (
                              <tr key={`${entry.id}-${index}`}>
                                <td className="py-1.5 font-medium text-white">{player.last_name || '-'}</td>
                                <td className="py-1.5 text-gray-300">{player.first_name || '-'}</td>
                                <td className="py-1.5 text-right font-bold text-cyan">{player.ranking ?? 'NC'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-500">
                        Liste joueurs a venir.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )})}
      </div>
    </div>
  )
}
