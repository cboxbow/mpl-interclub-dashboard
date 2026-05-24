'use client'

import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Plus, Save, Trash2, Upload } from 'lucide-react'
import type { Club, ClubPlayer, Division, PlayerRanking } from '@/lib/types'
import { getSupabase } from '@/lib/supabase'
import Image from 'next/image'

type PlayerDraft = ClubPlayer & { local_id: string }

interface Props {
  clubs: Club[]
  divisions: Division[]
  initialPlayers: ClubPlayer[]
  rankings: PlayerRanking[]
  supportsRankingLink: boolean
}

const blankPlayer = (clubId: number, order: number): PlayerDraft => ({
  local_id: `new-${clubId}-${order}-${Math.random().toString(36).slice(2)}`,
  club_id: clubId,
  last_name: '',
  first_name: '',
  ranking: null,
  ranking_points: null,
  ranking_gender: null,
  ranking_source_id: null,
  ranking_source_club: '',
  player_status: 'NvEQ',
  is_unranked: false,
  player_confirmed: false,
  club_validated: false,
  license_number: '',
  category: '',
  phone: '',
  email: '',
  notes: '',
  player_order: order,
})

const clean = (value: unknown) => String(value ?? '').trim()
const asBool = (value: unknown) => ['1', 'true', 'oui', 'yes', 'x'].includes(clean(value).toLowerCase())
const normalize = (value: unknown) => clean(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

const splitPlayerName = (fullName: string) => {
  const parts = clean(fullName).replace(/\s+/g, ' ').split(' ').filter(Boolean)
  return {
    first_name: parts[0] ?? '',
    last_name: parts.slice(1).join(' '),
  }
}

export default function ClubTeamsEditor({ clubs, divisions, initialPlayers, rankings, supportsRankingLink }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [importClubId, setImportClubId] = useState<number | null>(null)
  const [lookupByPlayer, setLookupByPlayer] = useState<Record<string, string>>({})
  const [activeLookupId, setActiveLookupId] = useState<string | null>(null)
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
  const rankingOptions = useMemo(() => (
    rankings
      .slice()
      .sort((a, b) => (a.gender === b.gender ? (Number(a.rank) || 99999) - (Number(b.rank) || 99999) : a.gender.localeCompare(b.gender)))
  ), [rankings])

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

  const activePlayers = (clubId: number) => (
    (playersByClub[clubId] ?? []).filter(player => player.last_name || player.first_name || player.ranking !== null || player.is_unranked)
  )

  const warningsForClub = (clubId: number) => {
    const active = activePlayers(clubId)
    const warnings: string[] = []
    if (active.length > 0 && active.length < 6) warnings.push('Minimum 6 joueurs requis pour jouer.')
    if (active.length > 9) warnings.push('Maximum 9 joueurs sur une feuille de match.')
    if (active.some(player => !player.player_confirmed || !player.club_validated)) warnings.push('Joueurs a confirmer et valider.')
    if (active.some(player => player.is_unranked && player.ranking !== null)) warnings.push('Joueur non classe avec un rang renseigne.')
    return warnings
  }

  const updatePlayer = (clubId: number, localId: string, field: keyof ClubPlayer, value: string | boolean) => {
    setPlayersByClub(prev => ({
      ...prev,
      [clubId]: (prev[clubId] ?? []).map(player => player.local_id === localId
        ? {
          ...player,
          [field]: field === 'ranking' || field === 'ranking_points' || field === 'ranking_source_id'
            ? (value === '' ? null : Number(value))
            : value,
        }
        : player),
    }))
  }

  const rankingMatches = (query: string, gender?: 'H' | 'F' | null) => {
    const needle = normalize(query)
    if (needle.length < 2) return []
    return rankingOptions
      .filter(item => (!gender || item.gender === gender) && normalize(item.player_name).includes(needle))
      .slice(0, 7)
  }

  const applyRanking = (clubId: number, localId: string, ranking: PlayerRanking) => {
    const names = splitPlayerName(ranking.player_name)
    const clubInfo = clubs.find(club => club.id === clubId)
    setPlayersByClub(prev => ({
      ...prev,
      [clubId]: (prev[clubId] ?? []).map(player => player.local_id === localId
        ? {
          ...player,
          last_name: names.last_name || player.last_name,
          first_name: names.first_name || player.first_name,
          ranking: ranking.rank ?? null,
          ranking_points: Number(ranking.total_points) || 0,
          ranking_gender: ranking.gender,
          ranking_source_id: ranking.id ?? null,
          ranking_source_club: ranking.club_name || ranking.source_club_name || '',
          phone: ranking.mobile || player.phone || clubInfo?.contact_phone || '',
          email: ranking.email || player.email || clubInfo?.contact_email || '',
          category: ranking.level || player.category || '',
          is_unranked: false,
        }
        : player),
    }))
    setLookupByPlayer(prev => ({
      ...prev,
      [localId]: ranking.player_name,
    }))
    setActiveLookupId(null)
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
      .map((player, index) => {
        const base = {
          club_id: clubId,
          last_name: player.last_name.trim(),
          first_name: player.first_name.trim(),
          ranking: player.ranking === null || Number.isNaN(Number(player.ranking)) ? null : Number(player.ranking),
          player_status: player.player_status ?? 'NvEQ',
          is_unranked: Boolean(player.is_unranked),
          player_confirmed: Boolean(player.player_confirmed),
          club_validated: Boolean(player.club_validated),
          license_number: clean(player.license_number) || null,
          category: clean(player.category) || null,
          phone: clean(player.phone) || null,
          email: clean(player.email) || null,
          notes: clean(player.notes) || null,
          player_order: index,
        }
        if (!supportsRankingLink) return base
        return {
          ...base,
          ranking_points: player.ranking_points === null || player.ranking_points === undefined || Number.isNaN(Number(player.ranking_points)) ? null : Number(player.ranking_points),
          ranking_gender: player.ranking_gender || null,
          ranking_source_id: player.ranking_source_id || null,
          ranking_source_club: clean(player.ranking_source_club) || null,
        }
      })
      .filter(player => player.last_name || player.first_name || player.ranking !== null || ('ranking_points' in player && player.ranking_points !== null) || player.is_unranked || player.license_number || player.category || player.phone || player.email || player.notes)

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

  const exportRows = (clubId?: number) => {
    const rows: Record<string, string | number | null>[] = []
    clubs.filter(club => !clubId || club.id === clubId).forEach(club => {
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
          points_ranking: player.ranking_points ?? '',
          genre_ranking: player.ranking_gender ?? '',
          club_ranking: player.ranking_source_club ?? '',
          ranking_source_id: player.ranking_source_id ?? '',
          statut: player.player_status ?? 'NvEQ',
          non_classe: player.is_unranked ? 'oui' : '',
          joueur_confirme: player.player_confirmed ? 'oui' : '',
          club_valide: player.club_validated ? 'oui' : '',
          licence: player.license_number ?? '',
          categorie: player.category ?? '',
          telephone: player.phone ?? '',
          email: player.email ?? '',
          notes: player.notes ?? '',
        })
      })
    })
    return rows
  }

  const exportExcel = async (clubId?: number) => {
    const XLSX = await import('xlsx')
    const club = clubId ? clubs.find(item => item.id === clubId) : null
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportRows(clubId))
    XLSX.utils.book_append_sheet(wb, ws, 'Equipes')
    XLSX.writeFile(wb, club ? `interclub-2026-${club.short_name}-joueurs.xlsx` : 'interclub-2026-equipes.xlsx')
  }

  const exportCsv = async (clubId?: number) => {
    const XLSX = await import('xlsx')
    const club = clubId ? clubs.find(item => item.id === clubId) : null
    const ws = XLSX.utils.json_to_sheet(exportRows(clubId))
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = club ? `interclub-2026-${club.short_name}-joueurs.csv` : 'interclub-2026-equipes.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importFile = async (file: File, clubId: number) => {
    setMessage('')
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
    const importedPlayers: PlayerDraft[] = []

    rows.forEach((row, order) => {
      const entries = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase().trim(), value]))
      const rankingRaw = clean(entries.rang || entries.ranking || entries.classement)
      const pointsRaw = clean(entries.points_ranking || entries.points || entries.total_points)
      const player: PlayerDraft = {
        local_id: `import-${clubId}-${order}-${Math.random().toString(36).slice(2)}`,
        club_id: clubId,
        last_name: clean(entries.nom || entries.last_name),
        first_name: clean(entries.prenom || entries.first_name),
        ranking: rankingRaw === '' ? null : Number(rankingRaw),
        ranking_points: pointsRaw === '' ? null : Number(pointsRaw),
        ranking_gender: (clean(entries.genre_ranking || entries.gender || entries.sexe) || null) as PlayerDraft['ranking_gender'],
        ranking_source_id: clean(entries.ranking_source_id) ? Number(entries.ranking_source_id) : null,
        ranking_source_club: clean(entries.club_ranking || entries.club_source || entries.ranking_club),
        player_status: (clean(entries.statut || entries.status || entries.player_status) || 'NvEQ') as PlayerDraft['player_status'],
        is_unranked: asBool(entries.non_classe || entries.unranked || entries.is_unranked),
        player_confirmed: asBool(entries.joueur_confirme || entries.confirmed || entries.player_confirmed),
        club_validated: asBool(entries.club_valide || entries.validated || entries.club_validated),
        license_number: clean(entries.licence || entries.license || entries.license_number),
        category: clean(entries.categorie || entries.category),
        phone: clean(entries.telephone || entries.phone || entries.tel),
        email: clean(entries.email || entries.mail),
        notes: clean(entries.notes || entries.detail || entries.details),
        player_order: order,
      }
      if (player.last_name || player.first_name || player.ranking !== null || player.ranking_points !== null || player.is_unranked || player.license_number || player.category || player.phone || player.email || player.notes) {
        importedPlayers.push(player)
      }
    })

    setPlayersByClub(prev => ({
      ...prev,
      [clubId]: importedPlayers.length ? importedPlayers : Array.from({ length: 8 }, (_, index) => blankPlayer(clubId, index)),
    }))
    const club = clubs.find(item => item.id === clubId)
    setMessage(`${importedPlayers.length} joueurs importes pour ${club?.name ?? 'ce club'}. Verifie puis sauvegarde ce club.`)
    if (fileRef.current) fileRef.current.value = ''
    setImportClubId(null)
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
              if (file && importClubId) importFile(file, importClubId)
            }}
          />
          <span className="text-xs text-gray-400">Import/export se fait dans chaque carte club.</span>
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
              const warnings = warningsForClub(club.id)
              return (
                <div key={club.id} className="glass-panel rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-cyan/20 px-3 py-2">
                    <div className="h-14 w-16 rounded bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden">
                      {club.logo_url ? (
                        <Image src={club.logo_url} alt={club.name} width={64} height={56} className="max-h-12 w-auto object-contain"/>
                      ) : (
                        <span className="text-[10px] text-gray-600">Logo</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase">Club</div>
                      <div className="font-black text-white">{club.name}</div>
                      <div className="text-xs text-gray-500">{divisionById.get(club.division_id)?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase">Poids total</div>
                      <div className="font-black interclub-blue-text text-xl">{totalForClub(club.id)}</div>
                      <div className="text-[11px] text-gray-500">{activePlayers(club.id).length}/9 joueurs</div>
                    </div>
                  </div>
                  <div className={`flex items-start gap-2 px-3 py-2 text-xs ${warnings.length ? 'bg-amber-500/10 text-amber-100' : 'bg-green-500/10 text-green-200'}`}>
                    {warnings.length ? <AlertTriangle size={14} className="shrink-0 mt-0.5"/> : <CheckCircle2 size={14} className="shrink-0 mt-0.5"/>}
                    <span>{warnings.length ? warnings.join(' ') : 'Equipe conforme aux controles de base.'}</span>
                  </div>
                  <div className="space-y-3 p-3">
                    {rows.map((player, index) => {
                      const lookupValue = lookupByPlayer[player.local_id] ?? [player.first_name, player.last_name].filter(Boolean).join(' ')
                      const matches = rankingMatches(lookupValue, div.category)
                      return (
                      <div key={player.local_id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan">Joueur {index + 1}</div>
                          <button
                            onClick={() => removePlayer(club.id, player.local_id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-gray-400 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
                            aria-label="Supprimer le joueur"
                          >
                            <Trash2 size={15}/>
                          </button>
                        </div>

                        <div className="relative mb-3 rounded-lg border border-cyan/15 bg-cyan/5 p-3">
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-cyan">
                            Recherche ranking officiel
                            <input
                              value={lookupValue}
                              onFocus={() => setActiveLookupId(player.local_id)}
                              onChange={e => {
                                setActiveLookupId(player.local_id)
                                setLookupByPlayer(prev => ({ ...prev, [player.local_id]: e.target.value }))
                              }}
                              placeholder="Ex: Mathieu Vallet"
                              className="mt-1 h-9 w-full rounded-md border border-cyan/20 bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan"
                            />
                          </label>
                          {activeLookupId === player.local_id && matches.length > 0 && (
                            <div className="mt-2 overflow-hidden rounded-md border border-cyan/20 bg-navy/95 shadow-xl">
                              {matches.map(match => (
                                <button
                                  key={`${match.gender}-${match.id ?? match.player_name}`}
                                  type="button"
                                  onClick={() => applyRanking(club.id, player.local_id, match)}
                                  className="grid w-full grid-cols-[1fr_auto] gap-3 border-b border-white/5 px-3 py-2 text-left text-xs text-gray-200 last:border-b-0 hover:bg-cyan/10"
                                >
                                  <span>
                                    <span className="font-black text-white">{match.player_name}</span>
                                    <span className="ml-2 text-cyan">{match.gender}</span>
                                    <span className="ml-2 text-gray-400">{match.club_name || match.source_club_name || 'Club a verifier'}</span>
                                  </span>
                                  <span className="font-bold text-cyan">Rang {match.rank ?? '-'} · {Number(match.total_points) || 0} pts</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {player.ranking_source_id && (
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-300">
                              <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2 py-1 text-cyan">Ranking lie</span>
                              <span>{player.ranking_gender} · {player.ranking_points ?? 0} pts</span>
                              {player.ranking_source_club && <span>Club source: {player.ranking_source_club}</span>}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_110px_120px]">
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Nom
                            <input value={player.last_name} onChange={e => updatePlayer(club.id, player.local_id, 'last_name', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Prenom
                            <input value={player.first_name} onChange={e => updatePlayer(club.id, player.local_id, 'first_name', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Rang
                            <input type="number" value={player.ranking ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'ranking', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-right text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Statut
                            <select value={player.player_status ?? 'NvEQ'} onChange={e => updatePlayer(club.id, player.local_id, 'player_status', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan">
                              <option value="EQ">EQ</option>
                              <option value="NvEQ">NvEQ</option>
                              <option value="INVIT">INVIT</option>
                            </select>
                          </label>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[150px_130px_1fr]">
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Licence
                            <input value={player.license_number ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'license_number', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Cat.
                            <input value={player.category ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'category', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Details / notes joueur
                            <input value={player.notes ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'notes', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[120px_110px_1fr_1fr]">
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Points
                            <input type="number" value={player.ranking_points ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'ranking_points', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-right text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Genre
                            <select value={player.ranking_gender ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'ranking_gender', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan">
                              <option value="">-</option>
                              <option value="H">H</option>
                              <option value="F">F</option>
                            </select>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Club ranking
                            <input value={player.ranking_source_club ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'ranking_source_club', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            ID source
                            <input type="number" value={player.ranking_source_id ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'ranking_source_id', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-right text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Telephone
                            <input value={player.phone ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'phone', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Email
                            <input value={player.email ?? ''} onChange={e => updatePlayer(club.id, player.local_id, 'email', e.target.value)}
                              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan"/>
                          </label>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${player.is_unranked ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-white/10 text-gray-300'}`}>
                            <input type="checkbox" checked={Boolean(player.is_unranked)} onChange={e => updatePlayer(club.id, player.local_id, 'is_unranked', e.target.checked)} className="accent-cyan"/>
                            Non classe
                          </label>
                          <label className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${player.player_confirmed ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-white/10 text-gray-300'}`}>
                            <input type="checkbox" checked={Boolean(player.player_confirmed)} onChange={e => updatePlayer(club.id, player.local_id, 'player_confirmed', e.target.checked)} className="accent-cyan"/>
                            Confirme joueur
                          </label>
                          <label className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${player.club_validated ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-white/10 text-gray-300'}`}>
                            <input type="checkbox" checked={Boolean(player.club_validated)} onChange={e => updatePlayer(club.id, player.local_id, 'club_validated', e.target.checked)} className="accent-cyan"/>
                            Valide club
                          </label>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => addPlayer(club.id)} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10">
                        <Plus size={14}/> Joueur
                      </button>
                      <button onClick={() => { setImportClubId(club.id); fileRef.current?.click() }} className="inline-flex items-center gap-2 rounded-md border border-cyan/30 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/10">
                        <Upload size={14}/> Import
                      </button>
                      <button onClick={() => exportExcel(club.id)} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10">
                        <FileSpreadsheet size={14}/> Excel
                      </button>
                      <button onClick={() => exportCsv(club.id)} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10">
                        <Download size={14}/> CSV
                      </button>
                    </div>
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
