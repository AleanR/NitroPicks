type Bet = {
  status: 'active' | 'win' | 'lose' | 'refunded'
  stake: number
  expectedPayout: number
  createdAt: string
}

type Props = {
  bets: Bet[]
}

export default function WeeklyProgressChart({ bets }: Props) {
  // Build last 7 days (oldest → newest)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const data = days.map((day) => {
    const dayBets = bets.filter((b) => {
      const bd = new Date(b.createdAt)
      return (
        bd.getFullYear() === day.getFullYear() &&
        bd.getMonth() === day.getMonth() &&
        bd.getDate() === day.getDate()
      )
    })

    const netKP = dayBets.reduce((sum, b) => {
      if (b.status === 'win') return sum + (b.expectedPayout - b.stake)
      if (b.status === 'lose') return sum - b.stake
      return sum
    }, 0)

    return {
      label: dayLabels[day.getDay()],
      netKP,
      betsCount: dayBets.length,
    }
  })

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.netKP)), 1)

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-blue-400">
            <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.918z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-white">Weekly Betting Progress</h2>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((d, i) => {
          const isPositive = d.netKP >= 0
          const heightPct = d.netKP === 0 ? 4 : Math.max((Math.abs(d.netKP) / maxAbs) * 100, 8)
          const isToday = i === 6

          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              {/* KP label */}
              <span className={`text-xs font-bold ${
                d.netKP > 0 ? 'text-green-400' :
                d.netKP < 0 ? 'text-red-400' : 'text-zinc-600'
              }`}>
                {d.netKP === 0 ? (d.betsCount > 0 ? '0' : '—') : `${d.netKP > 0 ? '+' : ''}${d.netKP}`}
              </span>

              {/* Bar */}
              <div className="w-full flex items-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    d.netKP === 0 && d.betsCount === 0
                      ? 'bg-zinc-800'
                      : isPositive
                      ? isToday ? 'bg-yellow-400' : 'bg-yellow-400/70'
                      : 'bg-red-500/70'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Day label */}
              <span className={`text-xs font-semibold ${isToday ? 'text-white' : 'text-zinc-500'}`}>
                {d.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-zinc-800 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <div className="h-2.5 w-2.5 rounded-sm bg-yellow-400/70" />
          Net gain
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-500/70" />
          Net loss
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <div className="h-2.5 w-2.5 rounded-sm bg-zinc-800" />
          No activity
        </div>
      </div>
    </section>
  )
}
