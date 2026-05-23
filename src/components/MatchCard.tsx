import type { Match } from '@/lib/types'
import { CheckCircle, Clock } from 'lucide-react'

interface Props { match: Match; showAdmin?: boolean; onEdit?: (m: Match) => void }

function pairResult(pairs: Match['pairs'], pn: 1|2|3) {
  const p = pairs?.find(x => x.pair_number === pn)
  if (!p || !p.winner) return null
  return { winner: p.winner, home: [p.home_s1,p.home_s2,p.home_s3], away: [p.away_s1,p.away_s2,p.away_s3] }
}

function setStr(home: (number|null)[], away: (number|null)[]) {
  return [0,1,2].filter(i => home[i]!==null && away[i]!==null)
    .map(i => `${home[i]}-${away[i]}`).join('  ')
}

export default function MatchCard({ match, showAdmin, onEdit }: Props) {
  const done = match.status === 'completed'
  const hpw = match.pairs?.filter(p=>p.winner==='home').length ?? 0
  const apw = match.pairs?.filter(p=>p.winner==='away').length ?? 0
  const hWon = hpw > apw

  return (
    <div className="bg-navy-800/60 rounded-lg border border-white/10 p-3 hover:border-cyan/30 transition">
      {/* Teams */}
      <div className="flex items-center gap-2">
        <span className={`flex-1 font-semibold text-sm truncate ${done && hWon ? 'text-cyan' : 'text-gray-200'}`}>
          {match.home_club?.name ?? '—'}
        </span>
        <div className="text-center shrink-0 min-w-[60px]">
          {done
            ? <span className="text-lg font-bold text-white">{hpw} – {apw}</span>
            : <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={11}/> à jouer</span>
          }
        </div>
        <span className={`flex-1 font-semibold text-sm truncate text-right ${done && !hWon ? 'text-cyan' : 'text-gray-200'}`}>
          {match.away_club?.name ?? '—'}
        </span>
      </div>
      {/* Pair details */}
      {done && (
        <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-gray-500">
          {([1,2,3] as const).map(pn => {
            const r = pairResult(match.pairs, pn)
            if (!r) return <div key={pn} className="text-center">P{pn} —</div>
            return (
              <div key={pn} className="text-center">
                <span className="text-gray-400">P{pn}</span>
                {' '}
                <span className={r.winner==='home' ? 'text-green-400' : 'text-red-400'}>
                  {setStr(r.home, r.away)}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {/* Admin edit */}
      {showAdmin && (
        <button
          onClick={() => onEdit?.(match)}
          className="mt-2 w-full text-xs py-1 rounded bg-cyan/10 text-cyan hover:bg-cyan/20 transition"
        >
          {done ? '✏️ Modifier' : '➕ Saisir scores'}
        </button>
      )}
    </div>
  )
}
