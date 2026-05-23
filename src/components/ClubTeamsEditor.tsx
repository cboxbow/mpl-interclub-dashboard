'use client'

import { useMemo, useRef, useState } from 'react'
import { Download, FileSpreadsheet, Plus, Save, Trash2, Upload } from 'lucide-react'
import type { Club, ClubPlayer, Division } from '@/lib/types'
import { getSupabase } from '@/lib/supabase'

type PlayerDraft = ClubPlayer & { local_id: string }

interface Props {
  clubs: Club[]
  divisions: Division[]
  initialPlayers: ClubPlayer[]
}

const blankPlayer = (clubId: number, order: number): PlayerDraft => ({
  local_id: `new-${clubId}-${order}-${Math.random().toString(36).slice(2)}`,
  club_id: clubId,
  last_name: '',
  first_name: '',
  ranking: null,
  player_order: order,
})

const clean = (value: unknown) => String(value ?? '').trim()

export default function ClubTeamsEditor({ clubs, divisions, initialPlayers }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [playersByClub, setPlayersByClub] = useState<Record<number, PlayerDraft[]>>(() => {
    const grouped: Record<number, PlayerDraft[]> = {}
    clubs.forEach(club => {
      const rows = initialPlayers
        .filter(player => player.club_id === club.id)
        .sort((a, b) => (a.player_order ?? 0) - (b.player_order ?? 0))
        .map((player, index) => ({
          ...player,
          local_id: player.id ? `db-${player.id}` : `row-${club.id}-${index}`,
          player_order: player.player_order ?? index,
        }))
      grouped[club.id] = rows.length ? rows : Array.from({ length: 8 }, (_, index) => blankPlayer(club.id, index))
    })
    return grouped
  })
  const [savingClub, setSavingClub] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const divisionById = useMemo(() => new Map(divisions.map(div => [div.id, div])), [divisions])
  const clubById = useMemo(() => new Map(clubs.map(club => [club.id, club])), [clubs])
  const clubLookup = useMemo(() => {
    const map = new Map<string, Club>()
    clubs.forEach(club => {
      map.set(club.name.toLowerCase(), club)
      map.set(club.short_name.toLowerCase(), club)
      map.set(String(club.id), club)
    })
    return map
  }, [clubs])

  const groupedClubs = useMemo(() => (
    divisions
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .map(div => ({
        div,
        clubs: clubs.filter(club => club.division_id === div.id),
      }))
  ), [clubs, divisions])

  const totalForClub = (clubId: number) => (
    (playersByClub[clubId] ?? []).reduce((sum, player) => sum + (Number(player.ranking) || 0), 0)
  )

  const updatePlayer = (clubId: number, localId: string, field: keyof ClubPlayer, value: string) => {
    setPlayersByClub(prev => ({
      ...prev,
      [clubId]: (prev[clubId] ?? []).map(player => player.local_id === localId
        ? {
          ...player,
          [field]: field === 'ranking'
            ? (value === '' ? null : Number(value))
            : value,
        }
        : player),
    }))
  }

  const addPlayer = (clubId: number) => {
    setPlayersByClub(prev => {
      const rows = prev[clubId] ?? []
      return { ...prev, [clubId]: [...rows, blankPlayer(clubId, rows.length)] }
    })
  }

  const removePlayer = (clubId: number, localId: string) => {
    setPlayersByClub(prev => ({
      ...prev,
      [clubId]: (prev[clubId] ?? []).filter(player => player.local_id !== localId),
    }))
  }

  const saveClub = async (clubId: number) => {
    setSavingClub(clubId)
    setMessage('')
    const rows = (playersByClub[clubId] ?? [])
      .map((player, index) => ({
        club_id: clubId,
        last_name: player.last_name.trim(),
        first_name: player.first_name.trim(),
        ranking: player.ranking === null || Number.isNaN(Number(player.ranking)) ? null : Number(player.ranking),
        player_order: index,
      }))
      .filter(player => player.last_name || player.first_name || player.ranking !== null)

    const sb = getSupabase()
    const { error: deleteError } = await sb.from('club_players').delete().eq('club_id', clubId)
    if (deleteError) {
      setMessage(`Erreur sauvegarde: ${deleteError.message}`)
      setSavingClub(null)
      return
    }
    const { data, error } = rows.length
      ? await sb.from('club_players').insert(rows).select('*')
      : { data: [], error: null }

    if (error) {
      setMessage(`Erreur sauvegarde: ${error.message}`)
    } else {
      setPlayersByClub(prev => ({
        ...prev,
        [clubId]: ((data ?? []) as ClubPlayer[]).map((player, index) => ({
          ...player,
          local_id: player.id ? `db-${player.id}` : `saved-${clubId}-${index}`,
        })).concat(rows.length ? [] : Array.from({ length: 8 }, (_, index) => blankPlayer(clubId, index))),
      }))
      setMessage('Equipe sauvegardee.')
    }
    setSavingClub(null)
  }

  const exportRows = () => {
    const rows: Record<string, string | number | null>[] = []
    clubs.forEach(club => {
      const div = divisionById.get(club.division_id)
      ;(playersByClub[club.id] ?? []).forEach(player => {
        if (!player.last_name && !player.first_name && player.ranking === null) return
        rows.push({
          club_id: club.id,
          club: club.name,
          division: div?.short_name ?? '',
          nom: player.last_name,
          prenom: player.first_name,
          rang: player.ranking,
        })
      })
    })
    return rows
  }

  const exportExcel = async () => {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportRows())
    XLSX.utils.book_append_sheet(wb, ws, 'Equipes')
    XLSX.writeFile(wb, 'interclub-2026-equipes.xlsx')
  }

  const exportCsv = async () => {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(exportRows())
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'interclub-2026-equipes.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importFile = async (file: File) => {
    setMessage('')
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
    const next: Record<number, PlayerDraft[]> = { ...playersByClub }
    const importedCounts = new Map<number, number>()

    rows.forEach(row => {
      const entries = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase().trim(), value]))
      const clubKey = clean(entries.club_id || entries.club || entries.equipe || entries.club_name).toLowerCase()
      const club = clubLookup.get(clubKey)
      if (!club) return

      const order = importedCounts.get(club.id) ?? 0
      const rankingRaw = clean(entries.rang || entries.ranking || entries.classement)
      const player: PlayerDraft = {
        local_id: `import-${club.id}-${order}-${Math.random().toString(36).slice(2)}`,
        club_id: club.id,
        last_name: clean(entries.nom || entries.last_name),
        first_name: clean(entries.prenom || entries.first_name),
        ranking: rankingRaw === '' ? null : Number(rankingRaw),
        player_order: order,
      }
      if (order === 0) next[club.id] = []
      next[club.id] = [...(next[club.id] ?? []), player]
      importedCounts.set(club.id, order + 1)
    })

    setPlayersByClub(next)
    setMessage(`${Array.from(importedCounts.values()).reduce((sum, count) => sum + count, 0)} joueurs importes. Verifie puis sauvegarde les clubs concernes.`)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="font-black uppercase text-white">Listes equipes par club</div>
          <p className="text-sm text-gray-300">Remplis les joueurs, leurs rangs, puis sauvegarde club par club.</p>
          {message && <p className="text-sm text-cyan mt-2">{message}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={event => {
              const file = event.target.files?.[0]
              if (file) importFile(file)
            }}
          />
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-cyan/30 px-3 py-2 text-sm text-cyan hover:bg-cyan/10">
            <Upload size={15}/> Import Excel/CSV
          </button>
          <button onClick={exportExcel} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
            <FileSpreadsheet size={15}/> Export Excel
          </button>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
            <Download size={15}/> Export CSV
          </button>
        </div>
      </div>

      {groupedClubs.map(({ div, clubs: divClubs }) => (
        <section key={div.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: `#${div.color}` }}/>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">{div.name}</h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {divClubs.map(club => {
              const rows = playersByClub[club.id] ?? []
              return (
                <div key={club.id} className="glass-panel rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-cyan/20 px-3 py-2">
                    <div>
                      <div className="text-xs text-gray-400 uppercase">Club</div>
                      <div className="font-black text-white">{club.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase">Poids total</div>
                      <div className="font-black interclub-blue-text text-xl">{totalForClub(club.id)}</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-cyan/10 text-xs uppercase text-cyan">
                        <tr>
                          <th className="px-2 py-2 text-left w-[30%]">Nom</th>
                          <th className="px-2 py-2 text-left w-[30%]">Prenom</th>
                          <th className="px-2 py-2 text-right w-24">Rang</th>
                          <th className="px-2 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {rows.map(player => (
                          <tr key={player.local_id}>
                            <td className="px-2 py-1.5">
                              <input value={player.last_name} onChange={e => updatePlayer(club.id, player.local_id, 'last_name', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-cyan"/>
                            </td>
                            <td className="px-2 py-1.5">
                              <input value={player.first_name} onChange={e => updatePlayer(club.id, player.local_id, 'first_name', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-cyan"/>
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" value={player.ranking ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'ranking', e.target.value)}
                                className="w-24 bg-black/20 border border-white/10 rounded px-2 py-1 text-right text-white outline-none focus:border-cyan"/>
                            </td>
                            <td className="px-2 py-1.5 text-right">
                              <button onClick={() => removePlayer(club.id, player.local_id)} className="p-1.5 rounded text-gray-500 hover:bg-red-500/10 hover:text-red-300">
                                <Trash2 size={14}/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
                    <button onClick={() => addPlayer(club.id)} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10">
                      <Plus size={14}/> Joueur
                    </button>
                    <button onClick={() => saveClub(club.id)} disabled={savingClub === club.id}
                      className="inline-flex items-center gap-2 rounded-md bg-cyan px-3 py-1.5 text-xs font-bold text-navy disabled:opacity-50">
                      <Save size={14}/> {savingClub === club.id ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
