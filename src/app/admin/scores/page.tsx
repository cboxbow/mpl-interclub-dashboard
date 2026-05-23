'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Division, Journee, Match } from '@/lib/types'
import { getSupabase } from '@/lib/supabase'
import MatchCard from '@/components/MatchCard'
import ScoreModal from '@/components/ScoreModal'
import { ChevronDown } from 'lucide-react'

export default function ScoresPage() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [journees, setJournees] = useState<Journee[]>([])
  const [selDiv, setSelDiv] = useState<number | null>(null)
  const [selJ, setSelJ] = useState<number | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const sb = getSupabase()
    Promise.all([
      sb.from('divisions').select('*').order('display_order'),
      sb.from('journees').select('*').order('number'),
    ]).then(([{ data: d }, { data: j }]) => {
      setDivisions(d ?? [])
      setJournees(j ?? [])
    })
  }, [])

  const loadMatches = useCallback(async () => {
    if (!selDiv || !selJ) return
    setLoading(true)
    const sb = getSupabase()
    const { data } = await sb.from('matches')
      .select('*, home_club:clubs!matches_home_club_id_fkey(*), away_club:clubs!matches_away_club_id_fkey(*), pairs:match_pairs(*)')
      .eq('division_id', selDiv).eq('journee_id', selJ)
    setMatches(data ?? [])
    setLoading(false)
  }, [selDiv, selJ])

  useEffect(() => { loadMatches() }, [loadMatches])

  const done = matches.filter(m => m.status === 'completed').length

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Saisie des scores</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Division</label>
          <div className="relative">
            <select
              value={selDiv ?? ''}
              onChange={e => setSelDiv(Number(e.target.value) || null)}
              className="w-full bg-navy border border-white/20 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:border-cyan outline-none pr-8"
            >
              <option value="">-- Choisir --</option>
              {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none"/>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Journée</label>
          <div className="relative">
            <select
              value={selJ ?? ''}
              onChange={e => setSelJ(Number(e.target.value) || null)}
              className="w-full bg-navy border border-white/20 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:border-cyan outline-none pr-8"
            >
              <option value="">-- Choisir --</option>
              {journees.map(j => <option key={j.id} value={j.id}>J{j.number} — {j.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none"/>
          </div>
        </div>
      </div>

      {/* Matches */}
      {loading && <div className="text-gray-500 text-sm animate-pulse">Chargement…</div>}
      {!loading && matches.length > 0 && (
        <>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{matches.length} match{matches.length > 1 ? 's' : ''}</span>
            <span className="text-green-400">{done}/{matches.length} complétés</span>
          </div>
          <div className="space-y-3">
            {matches.map(m => (
              <MatchCard key={m.id} match={m} showAdmin onEdit={setEditMatch}/>
            ))}
          </div>
        </>
      )}
      {!loading && selDiv && selJ && matches.length === 0 && (
        <div className="text-gray-500 text-sm">Aucun match pour cette sélection.</div>
      )}

      {/* Modal */}
      {editMatch && (
        <ScoreModal
          match={editMatch}
          onClose={() => setEditMatch(null)}
          onSaved={() => { setEditMatch(null); loadMatches() }}
        />
      )}
    </div>
  )
}
