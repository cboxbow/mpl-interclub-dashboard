import type { Standing } from '@/lib/types'

interface Props {
  standings: Standing[]
  compact?: boolean
}

const medal = (r: number) =>
  r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : String(r)

export default function StandingsTable({ standings, compact = false }: Props) {
  if (!standings.length) return (
    <div className="text-center py-8 text-gray-500 text-sm">Aucun résultat pour l'instant</div>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-navy-800 text-gray-400 text-xs uppercase">
            <th className="px-3 py-2 text-left w-8">#</th>
            <th className="px-3 py-2 text-left">Club</th>
            <th className="px-3 py-2 text-center w-10">MJ</th>
            <th className="px-3 py-2 text-center w-10">V</th>
            <th className="px-3 py-2 text-center w-10">D</th>
            <th className="px-3 py-2 text-center w-12 text-cyan font-bold">PTS</th>
            {!compact && <>
              <th className="px-3 py-2 text-center w-12">P.V</th>
              <th className="px-3 py-2 text-center w-12">ΔSets</th>
              <th className="px-3 py-2 text-center w-12">ΔJeux</th>
            </>}
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.club_id}
              className={`border-t border-white/5 transition
                ${i === 0 ? 'bg-cyan/10' : i === 1 ? 'bg-cyan/5' : 'hover:bg-white/5'}`}
            >
              <td className="px-3 py-2 text-center text-base">{medal(s.rank)}</td>
              <td className="px-3 py-2 font-medium text-gray-100">{s.club_name}</td>
              <td className="px-3 py-2 text-center text-gray-400">{s.mj}</td>
              <td className="px-3 py-2 text-center text-green-400">{s.v}</td>
              <td className="px-3 py-2 text-center text-red-400">{s.d}</td>
              <td className="px-3 py-2 text-center font-bold text-cyan text-base">{s.pts}</td>
              {!compact && <>
                <td className="px-3 py-2 text-center text-gray-400">{s.pw}</td>
                <td className={`px-3 py-2 text-center ${s.set_diff > 0 ? 'text-green-400' : s.set_diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {s.set_diff > 0 ? '+' : ''}{s.set_diff}
                </td>
                <td className={`px-3 py-2 text-center ${s.game_diff > 0 ? 'text-green-400' : s.game_diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {s.game_diff > 0 ? '+' : ''}{s.game_diff}
                </td>
              </>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
