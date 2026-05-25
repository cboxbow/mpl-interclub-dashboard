'use client'

import { useMemo, useRef, useState } from 'react'
import { Download, FileSpreadsheet, Plus, Save, Search, Trash2, Upload } from 'lucide-react'
import type { PlayerRanking } from '@/lib/types'

type Draft = PlayerRanking & { local_id: string }

const emptyRow = (): Draft => ({
  local_id: `new-${Math.random().toString(36).slice(2)}`,
  gender: 'H',
  rank: null,
  previous_rank: null,
  player_name: '',
  total_points: 0,
  club_name: '',
  source_club_name: '',
  mobile: '',
  email: '',
  level: '',
  source: 'Admin',
})

const cleanRows = (rows: Draft[]) => rows
  .filter(row => row.player_name.trim())
  .map(row => ({
    ...row,
    rank: row.rank === null || Number.isNaN(Number(row.rank)) ? null : Number(row.rank),
    previous_rank: row.previous_rank === null || Number.isNaN(Number(row.previous_rank)) ? null : Number(row.previous_rank),
    total_points: Number(row.total_points) || 0,
  }))

export default function RankingsEditor({ initialRows }: { initialRows: PlayerRanking[] }) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [rows, setRows] = useState<Draft[]>(() => initialRows.map((row, index) => ({ ...row, local_id: String(row.id ?? index) })))
  const [tab, setTab] = useState<'H' | 'F'>('H')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const visibleRows = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return rows
      .filter(row => row.gender === tab)
      .filter(row => {
        if (!needle) return true
        return [
          row.player_name,
          row.club_name,
          row.source_club_name,
          row.mobile,
          row.email,
          row.rank,
          row.total_points,
        ].some(value => String(value ?? '').toLowerCase().includes(needle))
      })
      .sort((a, b) => (a.rank ?? 999999) - (b.rank ?? 999999) || a.player_name.localeCompare(b.player_name))
  }, [rows, tab, search])

  const updateRow = (localId: string, field: keyof PlayerRanking, value: string) => {
    setRows(prev => prev.map(row => row.local_id === localId ? {
      ...row,
      [field]: field === 'rank' || field === 'previous_rank'
        ? (value === '' ? null : Number(value))
        : field === 'total_points'
          ? Number(value)
          : value,
    } : row))
  }

  const saveRow = async (row: Draft) => {
    setSaving(true)
    setMessage('')
    const url = row.id ? `/api/admin/rankings/${row.id}` : '/api/admin/rankings'
    const method = row.id ? 'PATCH' : 'POST'
    const response = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(row),
    })
    const json = await response.json()
    if (!response.ok) {
      setMessage(`Erreur sauvegarde: ${json.error}`)
    } else {
      const saved = row.id ? json.data : json.data?.[0]
      setRows(prev => prev.map(item => item.local_id === row.local_id ? { ...saved, local_id: String(saved.id) } : item))
      setMessage('Classement sauvegarde.')
    }
    setSaving(false)
  }

  const deleteRow = async (row: Draft) => {
    if (!window.confirm(`Supprimer ${row.player_name || 'cette ligne'} ?`)) return
    if (!row.id) {
      setRows(prev => prev.filter(item => item.local_id !== row.local_id))
      return
    }
    setSaving(true)
    const response = await fetch(`/api/admin/rankings/${row.id}`, { method: 'DELETE' })
    const json = await response.json()
    if (!response.ok) setMessage(`Erreur suppression: ${json.error}`)
    else {
      setRows(prev => prev.filter(item => item.local_id !== row.local_id))
      setMessage('Ligne supprimee.')
    }
    setSaving(false)
  }

  const clearAll = async () => {
    if (!window.confirm('Effacer tous les classements Supabase ?')) return
    setSaving(true)
    const response = await fetch('/api/admin/rankings', { method: 'DELETE' })
    const json = await response.json()
    if (!response.ok) setMessage(`Erreur purge: ${json.error}`)
    else {
      setRows([])
      setMessage('Tous les classements ont ete effaces.')
    }
    setSaving(false)
  }

  const importFile = async (file: File) => {
    setSaving(true)
    setMessage('')
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const imported = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
    const response = await fetch('/api/admin/rankings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rows: imported }),
    })
    const json = await response.json()
    if (!response.ok) {
      setMessage(`Erreur import: ${json.error}`)
    } else {
      const saved = (json.data ?? []) as PlayerRanking[]
      setRows(prev => {
        const byKey = new Map(prev.map(row => [`${row.gender}|${row.player_name}`, row]))
        saved.forEach((row, index) => byKey.set(`${row.gender}|${row.player_name}`, { ...row, local_id: String(row.id ?? `import-${index}`) }))
        return [...byKey.values()]
      })
      setMessage(`${saved.length} lignes importees / mises a jour.`)
    }
    if (fileRef.current) fileRef.current.value = ''
    setSaving(false)
  }

  const exportCsv = async () => {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(cleanRows(rows))
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'classements-interclub.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = async () => {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(cleanRows(rows))
    XLSX.utils.book_append_sheet(wb, ws, 'Classements')
    XLSX.writeFile(wb, 'classements-interclub.xlsx')
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="font-black uppercase text-white">Gestion classements</div>
            <p className="text-sm text-gray-400">Edition directe, ajout manuel, import Excel/CSV et suppression.</p>
            {message && <p className="mt-2 text-sm text-cyan">{message}</p>}
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
            <button onClick={() => setRows(prev => [{ ...emptyRow(), gender: tab }, ...prev])} className="inline-flex items-center gap-2 rounded-md border border-cyan/30 px-3 py-2 text-xs text-cyan hover:bg-cyan/10">
              <Plus size={14}/> Ajouter
            </button>
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-gray-200 hover:bg-white/10">
              <Upload size={14}/> Import
            </button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-gray-200 hover:bg-white/10">
              <Download size={14}/> CSV
            </button>
            <button onClick={exportExcel} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-gray-200 hover:bg-white/10">
              <FileSpreadsheet size={14}/> Excel
            </button>
            <button onClick={clearAll} disabled={saving} className="inline-flex items-center gap-2 rounded-md border border-red-400/30 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-50">
              <Trash2 size={14}/> Effacer tout
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex flex-wrap gap-2">
            {(['H', 'F'] as const).map(item => (
              <button key={item} onClick={() => setTab(item)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${tab === item ? 'bg-cyan text-navy' : 'border border-white/10 text-gray-300 hover:bg-white/10'}`}>
                {item === 'H' ? 'Hommes' : 'Dames'} ({rows.filter(row => row.gender === item).length})
              </button>
            ))}
          </div>
          <label className="ml-auto flex min-w-[260px] items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-1.5 text-sm text-gray-300 focus-within:border-cyan">
            <Search size={15} className="text-cyan"/>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Rechercher joueur, club, rang, points..."
              className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
            />
          </label>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="bg-cyan/10 text-xs uppercase text-cyan">
              <tr>
                <th className="px-2 py-2 text-left">Genre</th>
                <th className="px-2 py-2 text-left">Rang</th>
                <th className="px-2 py-2 text-left">Joueur</th>
                <th className="px-2 py-2 text-left">Points</th>
                <th className="px-2 py-2 text-left">Club</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleRows.map(row => (
                <tr key={row.local_id}>
                  <td className="px-2 py-2">
                    <select value={row.gender} onChange={event => updateRow(row.local_id, 'gender', event.target.value)}
                      className="w-20 rounded border border-white/10 bg-black/25 px-2 py-1.5 text-white outline-none focus:border-cyan">
                      <option value="H">H</option>
                      <option value="F">F</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" value={row.rank ?? ''} onChange={event => updateRow(row.local_id, 'rank', event.target.value)}
                      className="w-20 rounded border border-white/10 bg-black/25 px-2 py-1.5 text-white outline-none focus:border-cyan"/>
                  </td>
                  <td className="px-2 py-2">
                    <input value={row.player_name} onChange={event => updateRow(row.local_id, 'player_name', event.target.value)}
                      className="w-52 rounded border border-white/10 bg-black/25 px-2 py-1.5 font-bold text-white outline-none focus:border-cyan"/>
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" value={row.total_points ?? ''} onChange={event => updateRow(row.local_id, 'total_points', event.target.value)}
                      className="w-24 rounded border border-white/10 bg-black/25 px-2 py-1.5 text-white outline-none focus:border-cyan"/>
                  </td>
                  <td className="px-2 py-2">
                    <input value={row.club_name ?? ''} onChange={event => updateRow(row.local_id, 'club_name', event.target.value)}
                      className="w-56 rounded border border-white/10 bg-black/25 px-2 py-1.5 text-white outline-none focus:border-cyan"/>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => saveRow(row)} disabled={saving}
                        className="inline-flex h-8 w-8 items-center justify-center rounded bg-cyan text-navy disabled:opacity-50"
                        aria-label="Sauvegarder">
                        <Save size={14}/>
                      </button>
                      <button onClick={() => deleteRow(row)} disabled={saving}
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-400/30 text-red-200 hover:bg-red-500/10 disabled:opacity-50"
                        aria-label="Supprimer">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visibleRows.length && (
          <div className="p-6 text-center text-sm text-gray-500">Aucune ligne dans ce classement.</div>
        )}
      </div>
    </div>
  )
}
