'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
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
  const [addingDivision, setAddingDivision] = useState<number | null>(null)
  const [addChoice, setAddChoice] = useState('')
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

  const addTeam = async (divisionId: number) => {
    const selected = catalog.find(club => club.name === addChoice)
    if (!selected) return
    setSaving(true)
    setMessage('')
    const payload = {
      division_id: divisionId,
      name: selected.name,
      short_name: selected.shortName,
      logo_url: selected.logoUrl || null,
      venue_details: selected.venueDetails,
      contact_name: selected.contactName || null,
      contact_phone: selected.contactPhone || null,
      contact_email: selected.contactEmail || null,
    }
    const sb = getSupabase()
    const { data, error } = await sb.from('clubs').insert(payload).select('*').single()
    if (error) {
      setMessage(`Erreur ajout: ${error.message}`)
    } else if (data) {
      setClubs(prev => [...prev, data as Club].sort((a, b) => a.id - b.id))
      setAddingDivision(null)
      setAddChoice('')
      setMessage('Equipe ajoutee dans la division.')
    }
    setSaving(false)
  }

  const deleteTeam = async (club: Club) => {
    if (!window.confirm(`Supprimer ${club.name} de cette division ? Les matchs, scores et joueurs lies a cette equipe seront aussi retires.`)) return
    setSaving(true)
    setMessage('')
    const response = await fetch(`/api/admin/clubs/${club.id}`, { method: 'DELETE' })
    const json = await response.json()
    if (!response.ok) {
      setMessage(`Erreur suppression: ${json.error}`)
    } else {
      setClubs(prev => prev.filter(item => item.id !== club.id))
      setMessage(`Equipe supprimee. ${json.deleted_matches ?? 0} match(s) retire(s).`)
    }
    setSaving(false)
  }

  const resetDivision = async (div: Division) => {
    if (!window.confirm(`Remettre ${div.name} a zero ? Tous les clubs, joueurs, matchs et scores de cette division seront effaces.`)) return
    setSaving(true)
    setMessage('')
    const response = await fetch(`/api/admin/divisions/${div.id}/reset`, { method: 'DELETE' })
    const json = await response.json()
    if (!response.ok) {
      setMessage(`Erreur reset: ${json.error}`)
    } else {
      setClubs(prev => prev.filter(club => club.division_id !== div.id))
      setMessage(`${div.name} remis a zero: ${json.deleted_clubs ?? 0} club(s), ${json.deleted_matches ?? 0} match(s).`)
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
            <button
              onClick={() => { setAddingDivision(div.id); setAddChoice('') }}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-cyan/30 px-2 py-1 text-xs text-cyan hover:bg-cyan/10"
            >
              <Plus size={13}/> Ajouter
            </button>
            <button
              onClick={() => resetDivision(div)}
              disabled={saving || !divisionClubs.length}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-400/30 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-40"
            >
              <Trash2 size={13}/> Reset division
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {addingDivision === div.id && (
              <div className="px-4 py-3 bg-cyan/5">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <label className="text-xs text-gray-400">
                    Ajouter un club officiel dans cette division
                    <select value={addChoice} onChange={event => setAddChoice(event.target.value)}
                      className="mt-1 w-full bg-navy border border-cyan/40 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan">
                      <option value="">Choisir un club</option>
                      {catalog.map(item => (
                        <option key={item.name} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </label>
                  <button onClick={() => addTeam(div.id)} disabled={!addChoice || saving}
                    className="rounded-md bg-cyan px-3 py-2 text-xs font-bold text-navy disabled:opacity-50">
                    Ajouter
                  </button>
                  <button onClick={() => setAddingDivision(null)}
                    className="rounded-md border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/10">
                    Annuler
                  </button>
                </div>
              </div>
            )}
            {divisionClubs.map(club => {
              const selectedCatalog = editing === club.id ? catalog.find(item => item.name === editName) : null
              return (
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
                      {selectedCatalog && (
                        <div className="md:col-span-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Lieu</div>
                            <div className="mt-1 text-sm font-bold text-white">{selectedCatalog.location}</div>
                          </div>
                          <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Zone</div>
                            <div className="mt-1 text-sm font-bold text-white">{selectedCatalog.zone}</div>
                          </div>
                          <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Terrains</div>
                            <div className="mt-1 text-sm font-bold text-white">{selectedCatalog.courts}</div>
                          </div>
                        </div>
                      )}
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
                    <div className="flex flex-col gap-1">
                      <button onClick={() => startEdit(club)}
                        className="p-1.5 rounded text-gray-500 hover:text-cyan hover:bg-white/5 transition"
                        aria-label="Modifier cette equipe">
                        <Pencil size={14}/>
                      </button>
                      <button onClick={() => deleteTeam(club)}
                        className="p-1.5 rounded text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition"
                        aria-label="Supprimer cette equipe de la division">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
