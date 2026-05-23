'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import type { Club, Division } from '@/lib/types'
import type { ClubCatalogItem } from '@/lib/clubLogos'
import { getSupabase } from '@/lib/supabase'

interface Props {
  clubs: Club[]
  divisions: Division[]
  catalog?: ClubCatalogItem[]
}

export default function ClubEditor({ clubs: initial, divisions, catalog = [] }: Props) {
  const [clubs, setClubs] = useState(initial)
  const [editing, setEditing] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editShort, setEditShort] = useState('')
  const [editLogo, setEditLogo] = useState('')
  const [editVenue, setEditVenue] = useState('')
  const [editContactName, setEditContactName] = useState('')
  const [editContactPhone, setEditContactPhone] = useState('')
  const [editContactEmail, setEditContactEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const startEdit = (club: Club) => {
    setEditing(club.id)
    setEditName(club.name)
    setEditShort(club.short_name)
    setEditLogo(club.logo_url ?? '')
    setEditVenue(club.venue_details ?? '')
    setEditContactName(club.contact_name ?? '')
    setEditContactPhone(club.contact_phone ?? '')
    setEditContactEmail(club.contact_email ?? '')
    setMessage('')
  }

  const cancel = () => setEditing(null)

  const applyCatalogClub = (name: string) => {
    const selected = catalog.find(club => club.name === name)
    if (!selected) return
    setEditName(selected.name)
    setEditShort(selected.shortName)
    setEditLogo(selected.logoUrl)
    setEditVenue(selected.venueDetails)
    setEditContactName(selected.contactName)
    setEditContactPhone(selected.contactPhone)
    setEditContactEmail(selected.contactEmail)
  }

  const save = async (clubId: number) => {
    setSaving(true)
    setMessage('')
    const payload = {
      name: editName,
      short_name: editShort,
      logo_url: editLogo || null,
      venue_details: editVenue || null,
      contact_name: editContactName || null,
      contact_phone: editContactPhone || null,
      contact_email: editContactEmail || null,
    }
    const sb = getSupabase()
    const { error } = await sb.from('clubs').update(payload).eq('id', clubId)
    if (!error) {
      setClubs(prev => prev.map(club => club.id === clubId ? { ...club, ...payload, logo_url: editLogo || undefined } : club))
      setEditing(null)
      setMessage('Club mis a jour.')
    } else {
      setMessage(`Erreur sauvegarde: ${error.message}`)
    }
    setSaving(false)
  }

  const grouped = divisions
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map(div => ({ div, clubs: clubs.filter(club => club.division_id === div.id) }))

  return (
    <div className="space-y-6">
      {message && <div className="glass-panel rounded-xl px-4 py-3 text-sm text-cyan">{message}</div>}
      {grouped.map(({ div, clubs: divisionClubs }) => (
        <div key={div.id} className="glass-panel rounded-xl overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `2px solid #${div.color}33` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: `#${div.color}` }}/>
            <h3 className="font-bold text-sm">{div.name}</h3>
            <span className="text-xs text-gray-500">{divisionClubs.length} clubs</span>
          </div>
          <div className="divide-y divide-white/5">
            {divisionClubs.map(club => (
              <div key={club.id} className="px-4 py-3">
                {editing === club.id ? (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[180px_1fr_auto] lg:items-start">
                    <div className="h-28 rounded-lg bg-black/30 border border-cyan/20 flex items-center justify-center overflow-hidden">
                      {editLogo ? (
                        <Image src={editLogo} alt={editName || 'Club logo'} width={170} height={100} className="max-h-24 w-auto object-contain"/>
                      ) : (
                        <span className="text-xs text-gray-500">Logo automatique</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <label className="text-xs text-gray-400">
                        Club officiel
                        <select value={editName} onChange={event => applyCatalogClub(event.target.value)}
                          className="mt-1 w-full bg-navy border border-cyan/40 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan">
                          <option value="">Choisir un club</option>
                          {catalog.map(item => (
                            <option key={item.name} value={item.name}>{item.name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-gray-400">
                        Abreviation
                        <input value={editShort} onChange={event => setEditShort(event.target.value)}
                          className="mt-1 w-full bg-navy border border-cyan/40 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan"/>
                      </label>
                      <label className="text-xs text-gray-400 md:col-span-2">
                        Terrains / lieu
                        <input value={editVenue} onChange={event => setEditVenue(event.target.value)}
                          className="mt-1 w-full bg-navy border border-cyan/40 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan"/>
                      </label>
                      <label className="text-xs text-gray-400">
                        Contact
                        <input value={editContactName} onChange={event => setEditContactName(event.target.value)}
                          className="mt-1 w-full bg-navy border border-cyan/40 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan"/>
                      </label>
                      <label className="text-xs text-gray-400">
                        Telephone
                        <input value={editContactPhone} onChange={event => setEditContactPhone(event.target.value)}
                          className="mt-1 w-full bg-navy border border-cyan/40 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan"/>
                      </label>
                      <label className="text-xs text-gray-400 md:col-span-2">
                        Email
                        <input value={editContactEmail} onChange={event => setEditContactEmail(event.target.value)}
                          className="mt-1 w-full bg-navy border border-cyan/40 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan"/>
                      </label>
                    </div>
                    <div className="flex gap-2 lg:flex-col">
                      <button onClick={() => save(club.id)} disabled={saving}
                        className="p-2 rounded bg-cyan text-navy hover:bg-cyan-dark transition disabled:opacity-50">
                        <Check size={16}/>
                      </button>
                      <button onClick={cancel} className="p-2 rounded bg-white/10 text-gray-400 hover:text-white transition">
                        <X size={16}/>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-[64px_1fr_auto] gap-3 items-center">
                    <div className="h-12 w-16 shrink-0 rounded bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden">
                      {club.logo_url ? (
                        <Image src={club.logo_url} alt={club.name} width={64} height={48} className="max-h-11 w-auto object-contain"/>
                      ) : (
                        <span className="text-[10px] text-gray-600">Logo</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-gray-100">{club.name}</span>
                        <span className="text-xs text-cyan">{club.short_name}</span>
                      </div>
                      <div className="mt-1 grid grid-cols-1 gap-1 text-xs text-gray-400 md:grid-cols-2">
                        <span>Terrains: {club.venue_details || 'A completer'}</span>
                        <span>Contact: {club.contact_name || 'A completer'}{club.contact_phone ? ` · ${club.contact_phone}` : ''}{club.contact_email ? ` · ${club.contact_email}` : ''}</span>
                      </div>
                    </div>
                    <button onClick={() => startEdit(club)}
                      className="p-1.5 rounded text-gray-500 hover:text-cyan hover:bg-white/5 transition">
                      <Pencil size={14}/>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
