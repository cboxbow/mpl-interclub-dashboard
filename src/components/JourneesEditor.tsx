'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import { FileDown, FileUp, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import type { Journee } from '@/lib/types'

type EditableJournee = Journee & { localKey: string }

const emptyJournee = (nextNumber: number): EditableJournee => ({
  id: nextNumber,
  number: nextNumber,
  date: '',
  label: '',
  status: 'upcoming',
  localKey: `new-${Date.now()}-${nextNumber}`,
})

const csvEscape = (value: unknown) => {
  const text = String(value ?? '')
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const parseCsv = (text: string) => {
  const lines = text.split(/\r?\n/).filter(Boolean)
  const [headerLine, ...rows] = lines
  if (!headerLine) return []
  const separator = headerLine.includes(';') ? ';' : ','
  const headers = headerLine.split(separator).map(header => header.trim())
  return rows.map(line => {
    const values = line.split(separator).map(value => value.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}

export default function JourneesEditor({ journees: initial }: { journees: Journee[] }) {
  const [rows, setRows] = useState<EditableJournee[]>(() =>
    initial.map(row => ({ ...row, localKey: String(row.id) }))
  )
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const sortedRows = useMemo(
    () => rows.slice().sort((a, b) => a.number - b.number || a.id - b.id),
    [rows]
  )

  const patchRow = (localKey: string, patch: Partial<EditableJournee>) => {
    setRows(prev => prev.map(row => row.localKey === localKey ? { ...row, ...patch } : row))
  }

  const addRow = () => {
    const nextNumber = rows.reduce((max, row) => Math.max(max, row.number), 0) + 1
    setRows(prev => [...prev, emptyJournee(nextNumber)])
  }

  const saveRow = async (row: EditableJournee) => {
    setSaving(true)
    setMessage('')
    const payload = {
      id: row.id || row.number,
      number: row.number,
      date: row.date,
      label: row.label || `J${row.number}`,
      status: row.status,
    }
    const response = await fetch('/api/admin/journees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await response.json()
    if (!response.ok) {
      setMessage(`Erreur sauvegarde: ${json.error}`)
    } else {
      const saved = json.data?.[0] as Journee | undefined
      if (saved) patchRow(row.localKey, { ...saved, localKey: String(saved.id) })
      setMessage('Journee sauvegardee.')
    }
    setSaving(false)
  }

  const deleteRow = async (row: EditableJournee) => {
    if (!window.confirm(`Supprimer J${row.number} ? Les matchs et scores de cette journee seront aussi retires.`)) return
    setSaving(true)
    setMessage('')
    const response = await fetch(`/api/admin/journees/${row.id}`, { method: 'DELETE' })
    const json = await response.json()
    if (!response.ok) {
      setMessage(`Erreur suppression: ${json.error}`)
    } else {
      setRows(prev => prev.filter(item => item.localKey !== row.localKey))
      setMessage(`Journee supprimee. ${json.deleted_matches ?? 0} match(s) retire(s).`)
    }
    setSaving(false)
  }

  const resetAll = async () => {
    if (!window.confirm('Effacer tout le calendrier ? Tous les matchs et scores lies aux journees seront aussi retires.')) return
    setSaving(true)
    setMessage('')
    const response = await fetch('/api/admin/journees', { method: 'DELETE' })
    const json = await response.json()
    if (!response.ok) {
      setMessage(`Erreur reset: ${json.error}`)
    } else {
      setRows([])
      setMessage(`Calendrier remis a zero. ${json.deleted_matches ?? 0} match(s) retire(s).`)
    }
    setSaving(false)
  }

  const importRows = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setSaving(true)
    setMessage('')
    try {
      let imported: Record<string, unknown>[] = []
      if (file.name.toLowerCase().endsWith('.csv')) {
        imported = parseCsv(await file.text())
      } else {
        const XLSX = await import('xlsx')
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        imported = XLSX.utils.sheet_to_json(firstSheet, { raw: false })
      }

      const response = await fetch('/api/admin/journees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: imported }),
      })
      const json = await response.json()
      if (!response.ok) {
        setMessage(`Erreur import: ${json.error}`)
      } else {
        const saved = (json.data ?? []) as Journee[]
        setRows(prev => {
          const byId = new Map(prev.map(row => [row.id, row]))
          saved.forEach(row => byId.set(row.id, { ...row, localKey: String(row.id) }))
          return [...byId.values()]
        })
        setMessage(`${saved.length} journee(s) importee(s).`)
      }
    } catch (error) {
      setMessage(`Erreur import: ${error instanceof Error ? error.message : 'fichier invalide'}`)
    }
    setSaving(false)
  }

  const exportCsv = () => {
    const header = ['id', 'number', 'date', 'label', 'status']
    const body = sortedRows.map(row => header.map(key => csvEscape(row[key as keyof Journee])).join(';'))
    const blob = new Blob([[header.join(';'), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'interclub-journees.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {message && <div className="glass-panel rounded-xl px-4 py-3 text-sm text-cyan">{message}</div>}

      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={addRow} className="inline-flex items-center gap-2 rounded-md bg-cyan px-3 py-2 text-sm font-bold text-navy">
            <Plus size={16}/> Ajouter
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-cyan/30 px-3 py-2 text-sm text-cyan hover:bg-cyan/10">
            <FileUp size={16}/> Import CSV/Excel
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={importRows}/>
          </label>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/10">
            <FileDown size={16}/> Export CSV
          </button>
          <button onClick={resetAll} disabled={saving || !rows.length} className="ml-auto inline-flex items-center gap-2 rounded-md border border-red-400/30 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10 disabled:opacity-40">
            <RotateCcw size={16}/> Effacer tout
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-xl">
        <div className="hidden grid-cols-[80px_150px_1fr_150px_92px] gap-3 border-b border-cyan/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-cyan md:grid">
          <div>Journee</div>
          <div>Date</div>
          <div>Libelle</div>
          <div>Statut</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {sortedRows.map(row => (
            <div key={row.localKey} className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-[80px_150px_1fr_150px_92px] md:items-center">
              <input
                type="number"
                min={1}
                value={row.number}
                onChange={event => patchRow(row.localKey, { number: Number(event.target.value), id: Number(event.target.value) || row.id })}
                className="rounded border border-cyan/30 bg-navy px-2 py-2 text-sm text-white"
                aria-label="Numero journee"
              />
              <input
                type="date"
                value={row.date}
                onChange={event => patchRow(row.localKey, { date: event.target.value })}
                className="rounded border border-cyan/30 bg-navy px-2 py-2 text-sm text-white"
                aria-label="Date"
              />
              <input
                value={row.label}
                onChange={event => patchRow(row.localKey, { label: event.target.value })}
                className="rounded border border-cyan/30 bg-navy px-2 py-2 text-sm text-white"
                placeholder={`J${row.number}`}
                aria-label="Libelle"
              />
              <select
                value={row.status}
                onChange={event => patchRow(row.localKey, { status: event.target.value as Journee['status'] })}
                className="rounded border border-cyan/30 bg-navy px-2 py-2 text-sm text-white"
                aria-label="Statut"
              >
                <option value="upcoming">A venir</option>
                <option value="active">Live</option>
                <option value="completed">Termine</option>
              </select>
              <div className="flex justify-end gap-1">
                <button onClick={() => saveRow(row)} disabled={saving || !row.number || !row.date} className="rounded bg-cyan p-2 text-navy disabled:opacity-40" aria-label="Sauvegarder">
                  <Save size={16}/>
                </button>
                <button onClick={() => deleteRow(row)} disabled={saving} className="rounded p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-200 disabled:opacity-40" aria-label="Supprimer">
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
          {!rows.length && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Aucun calendrier. Ajoute une journee manuellement ou importe un fichier CSV/Excel.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
