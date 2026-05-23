'use client'

import { useEffect, useMemo, useState } from 'react'

interface Props {
  date: string
  label: string
}

const getRemaining = (target: number) => {
  const diff = Math.max(0, target - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

export default function Countdown({ date, label }: Props) {
  const target = useMemo(() => new Date(`${date}T18:00:00+04:00`).getTime(), [date])
  const [remaining, setRemaining] = useState(() => getRemaining(target))

  useEffect(() => {
    setRemaining(getRemaining(target))
    const timer = window.setInterval(() => setRemaining(getRemaining(target)), 1000)
    return () => window.clearInterval(timer)
  }, [target])

  return (
    <div className="rounded-xl border border-cyan/30 bg-cyan/10 p-3 text-center shadow-[0_0_30px_rgba(1,208,251,0.16)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300">Compte a rebours</div>
      <div className="mt-1 text-sm text-white">{label}</div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[
          ['Jours', remaining.days],
          ['Hrs', remaining.hours],
          ['Min', remaining.minutes],
          ['Sec', remaining.seconds],
        ].map(([unit, value]) => (
          <div key={unit} className="rounded-md border border-white/10 bg-black/25 px-2 py-2">
            <div className="interclub-blue-text text-xl font-black tabular-nums">{String(value).padStart(2, '0')}</div>
            <div className="text-[10px] uppercase text-gray-400">{unit}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
