import Image from 'next/image'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Club, ClubPlayer, Division } from '@/lib/types'
import { UsersRound } from 'lucide-react'
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="glass-panel rounded-2xl p-5 text-center sm:p-6">
        <div className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.28em] interclub-blue-text">
          <UsersRound size={18}/> Equipes publiques
        </div>
        <h1 className="interclub-title text-3xl font-black uppercase leading-none sm:text-5xl">Joueurs par club</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-300">
          Vue publique simplifiee: noms et ranking uniquement. Les contacts, licences et notes restent reserves a l'admin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groupedEntries.map(([clubName, entries]) => {
          const catalog = catalogByName.get(clubName)
          const logoUrl = catalog?.logoUrl || entries.find(entry => entry.logo_url)?.logo_url
          return (
          <section key={clubName} className="glass-panel overflow-hidden rounded-xl">
            <div className="flex items-center gap-3 border-b border-cyan/20 px-4 py-3">
              <div className="flex h-14 w-16 items-center justify-center overflow-hidden rounded border border-white/10 bg-black/30">
                {logoUrl ? (
                  <Image src={logoUrl} alt={clubName} width={64} height={52} className="max-h-12 w-auto object-contain"/>
                ) : (
                  <span className="text-[10px] text-gray-600">Logo</span>
                )}
              </div>
              <div>
                <h2 className="font-black uppercase text-white">{clubName}</h2>
                <div className="text-xs text-gray-400">{entries.length} division{entries.length > 1 ? 's' : ''}</div>
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
