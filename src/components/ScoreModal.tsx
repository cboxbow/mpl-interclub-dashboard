'use client'
import { useState } from 'react'
import type { Match, MatchPair } from '@/lib/types'
import { getSupabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface Props { match: Match; onClose: () => void; onSaved: () => void }

function computeWinner(h1:number,a1:number,h2:number,a2:number,h3?:number,a3?:number): 'home'|'away' {
  const hw = (h1>a1 ? 1:0) + (h2>a2 ? 1:0) + (h3!==undefined&&a3!==undefined ? (h3>a3?1:0) : 0)
  const aw = (a1>h1 ? 1:0) + (a2>h2 ? 1:0) + (h3!==undefined&&a3!==undefined ? (a3>h3?1:0) : 0)
  return hw >= aw ? 'home' : 'away'
}

export default function ScoreModal({ match, onClose, onSaved }: Props) {
  const initPairs = (): Record<number, Partial<MatchPair>> => {
    const r: Record<number, Partial<MatchPair>> = {}
    for (const pn of [1,2,3]) {
      const existing = match.pairs?.find(p => p.pair_number === pn) ?? {}
      r[pn] = { pair_number: pn as 1|2|3, ...existing }
    }
    return r
  }
  const [pairs, setPairs] = useState(initPairs)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (pn: number, key: keyof MatchPair, value: string) => {
    const v = value === '' ? null : parseInt(value)
    setPairs(prev => ({ ...prev, [pn]: { ...prev[pn], [key]: v } }))
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    const sb = getSupabase()
    try {
      for (const pn of [1,2,3]) {
        const p = pairs[pn]
        if (p.home_s1==null || p.away_s1==null || p.home_s2==null || p.away_s2==null) continue
        const winner = computeWinner(p.home_s1,p.away_s1,p.home_s2,p.away_s2,p.home_s3??undefined,p.away_s3??undefined)
        const { error: e } = await sb.from('match_pairs').upsert({
          match_id: match.id, pair_number: pn,
          home_s1: p.home_s1, away_s1: p.away_s1,
          home_s2: p.home_s2, away_s2: p.away_s2,
          home_s3: p.home_s3 ?? null, away_s3: p.away_s3 ?? null,
          winner
        }, { onConflict: 'match_id,pair_number' })
        if (e) throw e
      }
      onSaved()
    } catch(e: any) {
      setError(e.message ?? 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const ScoreInput = ({ pn, side, set }: { pn:number; side:'home'|'away'; set:1|2|3 }) => {
    const key = `${side}_s${set}` as keyof MatchPair
    const val = pairs[pn][key] ?? ''
    return (
      <input
        type="number" min={0} max={99}
        value={val === null ? '' : String(val)}
        onChange={e => update(pn, key, e.target.value)}
        className="w-12 text-center bg-navy border border-white/20 rounded px-1 py-1 text-white text-sm focus:border-cyan outline-none"
        placeholder="—"
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 border border-cyan/30 rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <div className="font-bold text-cyan">Saisie des scores</div>
            <div className="text-sm text-gray-400">
              {match.home_club?.name} <span className="text-gray-600">vs</span> {match.away_club?.name}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X size={20}/></button>
        </div>

        {/* Pairs */}
        <div className="p-4 space-y-4">
          {[1,2,3].map(pn => (
            <div key={pn} className="bg-navy/60 rounded-lg p-3">
              <div className="text-xs font-bold text-gray-400 mb-2">PAIRE {pn}</div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-xs text-gray-500">
                <div className="text-right text-gray-300 text-sm font-medium truncate pr-2">
                  {match.home_club?.short_name ?? 'Hôte'}
                </div>
                <div className="text-center text-gray-600">VS</div>
                <div className="text-left text-gray-300 text-sm font-medium truncate pl-2">
                  {match.away_club?.short_name ?? 'Visit.'}
                </div>
              </div>
              {[1,2,3].map(set => (
                <div key={set} className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-600 w-10">
                    {set === 3 ? 'GTB' : `Set ${set}`}
                  </span>
                  <ScoreInput pn={pn} side="home" set={set as 1|2|3}/>
                  <span className="text-gray-600">–</span>
                  <ScoreInput pn={pn} side="away" set={set as 1|2|3}/>
                  {pairs[pn][`home_s${set}` as keyof MatchPair] != null && (
                    <span className="text-xs text-gray-500 ml-2">
                      {(pairs[pn][`home_s${set}` as keyof MatchPair] as number) >
                       (pairs[pn][`away_s${set}` as keyof MatchPair] as number ?? -1)
                        ? '✅ Hôte' : '✅ Visit.'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {error && <div className="mx-4 mb-2 text-red-400 text-sm">{error}</div>}

        <div className="p-4 border-t border-white/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/20 text-gray-400 hover:text-white transition text-sm">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-cyan text-navy font-bold hover:bg-cyan-dark transition text-sm disabled:opacity-50"
          >
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
