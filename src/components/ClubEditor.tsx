'use client'
import { useState } from 'react'
import type { Club, Division } from '@/lib/types'
import { getSupabase } from '@/lib/supabase'
import { Pencil, Check, X } from 'lucide-react'

interface Props { clubs: Club[]; divisions: Division[] }

export default function ClubEditor({ clubs: initial, divisions }: Props) {
  const [clubs, setClubs] = useState(initial)
  const [editing, setEditing] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editShort, setEditShort] = useState('')
  const [saving, setSaving] = useState(false)

  const startEdit = (c: Club) => {
    setEditing(c.id); setEditName(c.name); setEditShort(c.short_name)
  }
  const cancel = () => setEditing(null)

  const save = async (clubId: number) => {
    setSaving(true)
    const sb = getSupabase()
    const { error } = await sb.from('clubs')
      .update({ name: editName, short_name: editShort })
      .eq('id', clubId)
    if (!error) {
      setClubs(prev => prev.map(c => c.id === clubId ? { ...c, name: editName, short_name: editShort } : c))
      setEditing(null)
    }
    setSaving(false)
  }

  const grouped = divisions
    .sort((a,b) => a.display_order - b.display_order)
    .map(d => ({ div: d, clubs: clubs.filter(c => c.division_id === d.id) }))

  return (
    <div className="space-y-6">
      {grouped.map(({ div, clubs: dc }) => (
        <div key={div.id} className="bg-navy-800/40 rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: `2px solid #${div.color}33` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: `#${div.color}` }}/>
            <h3 className="font-bold text-sm">{div.name}</h3>
            <span className="text-xs text-gray-500">{dc.length} clubs</span>
          </div>
          <div className="divide-y divide-white/5">
            {dc.map(club => (
              <div key={club.id} className="px-4 py-2 flex items-center gap-3">
                {editing === club.id ? (
                  <>
                    <input value={editName} onChange={e=>setEditName(e.target.value)}
                      className="flex-1 bg-navy border border-cyan/40 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan"
                      placeholder="Nom du club"
                    />
                    <input value={editShort} onChange={e=>setEditShort(e.target.value)}
                      className="w-20 bg-navy border border-cyan/40 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan"
                      placeholder="Court"
                    />
                    <button onClick={() => save(club.id)} disabled={saving}
                      className="p-1.5 rounded bg-cyan text-navy hover:bg-cyan-dark transition disabled:opacity-50">
                      <Check size={14}/>
                    </button>
                    <button onClick={cancel} className="p-1.5 rounded bg-white/10 text-gray-400 hover:text-white transition">
                      <X size={14}/>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-200">{club.name}</span>
                    <span className="text-xs text-gray-500 w-16">{club.short_name}</span>
                    <button onClick={() => startEdit(club)}
                      className="p-1.5 rounded text-gray-500 hover:text-cyan hover:bg-white/5 transition">
                      <Pencil size={13}/>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
