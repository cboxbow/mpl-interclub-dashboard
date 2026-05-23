import Image from 'next/image'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Club, ClubPlayer, Division } from '@/lib/types'
import { UsersRound } from 'lucide-react'

export const revalidate = 60

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
    if (!grouped.has(club.name)) grouped.set(club.name, [])
    grouped.get(club.name)?.push(club)
  })

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
        {[...grouped.entries()].map(([clubName, entries]) => (
          <section key={clubName} className="glass-panel overflow-hidden rounded-xl">
            <div className="flex items-center gap-3 border-b border-cyan/20 px-4 py-3">
              <div className="flex h-14 w-16 items-center justify-center overflow-hidden rounded border border-white/10 bg-black/30">
                {entries[0]?.logo_url ? (
                  <Image src={entries[0].logo_url} alt={clubName} width={64} height={52} className="max-h-12 w-auto object-contain"/>
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
        ))}
      </div>
    </div>
  )
}
