import { Link } from 'react-router-dom'

type Bet = {
  _id: string
  status: 'active' | 'win' | 'lose' | 'refunded'
  stake: number
  expectedPayout: number
  createdAt: string
  legs: Array<{
    team: 'home' | 'away'
    gameId?: any
  }>
}

type Props = {
  bets: Bet[]
}

export default function RecentBetsPanel({ bets }: Props) {
  const recent = bets.slice(0, 3)

  const statusStyle = (status: Bet['status']) => {
    switch (status) {
      case 'win':      return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'lose':     return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'active':   return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'refunded': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
    }
  }

  const statusLabel = (status: Bet['status']) => {
    switch (status) {
      case 'win':      return 'Won'
      case 'lose':     return 'Lost'
      case 'active':   return 'Active'
      case 'refunded': return 'Refunded'
    }
  }

  const getTeamName = (bet: Bet) => {
    const leg = bet.legs?.[0]
    if (!leg) return 'Unknown'
    const game = leg.gameId
    if (!game || typeof game === 'string') return leg.team === 'home' ? 'Home' : 'Away'
    return leg.team === 'home'
      ? game.homeTeam ?? 'Home'
      : game.awayTeam ?? 'Away'
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Recent Bets</p>
        <Link to="/bet-history" className="text-xs font-semibold text-yellow-400 hover:underline">
          View All →
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-center text-sm text-zinc-600 py-4">No bets placed yet.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((bet) => (
            <div key={bet._id} className="flex items-center justify-between rounded-2xl bg-black px-4 py-3 gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{getTeamName(bet)}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(bet.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' · '}{bet.stake} KP staked
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${statusStyle(bet.status)}`}>
                  {statusLabel(bet.status)}
                </span>
                {bet.status === 'win' && (
                  <span className="text-xs font-semibold text-green-400">+{Math.round(bet.expectedPayout - bet.stake)} KP</span>
                )}
                {bet.status === 'lose' && (
                  <span className="text-xs font-semibold text-red-400">-{bet.stake} KP</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
