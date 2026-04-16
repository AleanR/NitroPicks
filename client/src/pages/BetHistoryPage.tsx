import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'

interface Game {
  _id: string
  homeTeam: string
  awayTeam: string
  emoji: string
  sport: string
  scoreHome: number
  scoreAway: number
}

interface BetLeg {
  gameId: Game | string
  team: 'home' | 'away'
  odds: number
  result: 'pending' | 'win' | 'lose' | 'cancelled' | 'tie'
}

interface Bet {
  _id: string
  stake: number
  betType: 'single' | 'parlay'
  status: 'active' | 'win' | 'lose' | 'refunded'
  legs: BetLeg[]
  totalOdds: number
  expectedPayout: number
  createdAt: string
}

type FilterStatus = 'all' | 'active' | 'win' | 'lose' | 'refunded'

function statusBadge(status: Bet['status']) {
  switch (status) {
    case 'active':
      return <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">Pending</span>
    case 'win':
      return <span className="rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">Won</span>
    case 'lose':
      return <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">Lost</span>
    case 'refunded':
      return <span className="rounded-full border border-zinc-500/40 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-400">Refunded</span>
  }
}

function legResultIcon(result: BetLeg['result']) {
  switch (result) {
    case 'win':      return <span className="text-green-400">✓</span>
    case 'lose':     return <span className="text-red-400">✗</span>
    case 'tie':     return <span className="text-zinc-500">○</span>
    case 'cancelled': return <span className="text-zinc-500">—</span>
    default:         return <span className="text-yellow-400">•</span>
  }
}

function getTeamLabel(leg: BetLeg): string {
  const game = leg.gameId as Game
  if (typeof game === 'string') return leg.team === 'home' ? 'Home' : 'Away'
  return leg.team === 'home' ? game.homeTeam : game.awayTeam
}

function getGameScore(leg: BetLeg): string {
  const game = leg.gameId as Game
  if (typeof game === 'string') return 'Game unavailable'
  return `${game.scoreHome.toString()} - ${game.scoreAway.toString()}`
}

function getMatchup(leg: BetLeg): string {
  const game = leg.gameId as Game
  if (typeof game === 'string') return 'Game unavailable'
  return `${game.emoji} ${game.homeTeam} vs ${game.awayTeam}`
}

export default function BetHistoryPage() {
  const navigate = useNavigate()
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/bets/my/list', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) { navigate('/login'); return null }
        return r.json()
      })
      .then((data) => { if (Array.isArray(data)) setBets(data) })
      .catch(() => {})
      .finally(() => setLoading(false))

      window.scrollTo(0, 0)
  }, [navigate])

  const filtered = filter === 'all' ? bets : bets.filter((b) => b.status === filter)

  const totalWon = bets
    .filter((b) => b.status === 'win')
    .reduce((sum, b) => sum + Math.round(b.expectedPayout), 0)

  const totalStaked = bets
    .filter((b) => b.status !== 'refunded')
    .reduce((sum, b) => sum + b.stake, 0)

  const netProfit = totalWon - bets
    .filter((b) => b.status === 'lose')
    .reduce((sum, b) => sum + b.stake, 0)

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'active' },
    { label: 'Won', value: 'win' },
    { label: 'Lost', value: 'lose' },
    { label: 'Refunded', value: 'refunded' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-1 text-4xl font-extrabold">Bet History</h1>
        <p className="mb-8 text-zinc-400">All your placed bets in one place</p>

        {/* Summary cards */}
        {!loading && bets.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#14161d] p-4 text-center">
              <p className="text-2xl font-extrabold">{bets.length}</p>
              <p className="mt-1 text-xs text-zinc-400">Total Bets</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-[#14161d] p-4 text-center">
              <p className="text-2xl font-extrabold text-green-400">
                {bets.filter((b) => b.status === 'win').length}
              </p>
              <p className="mt-1 text-xs text-zinc-400">Won</p>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-[#14161d] p-4 text-center">
              <p className="text-2xl font-extrabold text-red-400">
                {bets.filter((b) => b.status === 'lose').length}
              </p>
              <p className="mt-1 text-xs text-zinc-400">Lost</p>
            </div>
            <div className={`rounded-2xl border bg-[#14161d] p-4 text-center ${netProfit >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <p className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} KP
              </p>
              <p className="mt-1 text-xs text-zinc-400">Net Profit</p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                filter === f.value
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-zinc-700 bg-[#14161d] text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  {bets.filter((b) => b.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bet list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-zinc-800 bg-[#14161d]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-zinc-300">No bets found</p>
            <p className="mt-2 text-sm text-zinc-500">
              {filter === 'all' ? "You haven't placed any bets yet." : `No ${filter} bets.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/markets')}
                className="mt-6 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-300 transition"
              >
                Go to Markets
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((bet) => {
              const isExpanded = expandedId === bet._id
              const payout = Math.round(bet.expectedPayout)
              const date = new Date(bet.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })

              return (
                <div
                  key={bet._id}
                  className="rounded-2xl border border-zinc-800 bg-[#14161d] overflow-hidden"
                >
                  {/* Header row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : bet._id)}
                    className="w-full px-5 py-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {statusBadge(bet.status)}
                        <span className="truncate text-sm font-semibold text-zinc-300 capitalize">
                          {bet.betType} · {bet.legs.length} leg{bet.legs.length > 1 ? 's' : ''}
                        </span>
                        <span className="hidden text-xs text-zinc-500 sm:block">{date}</span>
                      </div>

                      <div className="flex shrink-0 items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Stake</p>
                          <p className="text-sm font-bold text-white">{bet.stake.toLocaleString()} KP</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Payout</p>
                          <p className={`text-sm font-bold ${bet.status === 'win' ? 'text-green-400' : bet.status === 'lose' ? 'text-red-400' : 'text-zinc-300'}`}>
                            {bet.status === 'win' ? '+' : bet.status === 'lose' ? '−' : ''}{payout.toLocaleString()} KP
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded legs */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800 px-5 py-4">
                      <div className="mb-3 grid grid-cols-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        <span>Matchup</span>
                        <span className="text-center">Pick · Odds</span>
                        <span className="text-right">Result</span>
                      </div>
                      <div className="space-y-3">
                        {bet.legs.map((leg, i) => (
                          <div key={i} className="grid grid-cols-3 items-center text-sm">
                            <span className="truncate text-zinc-300">{getMatchup(leg)}</span>
                            <span className="text-center text-zinc-400">
                              {getTeamLabel(leg)} · <span className="text-yellow-400">{leg.odds.toFixed(2)}x</span>
                            </span>
                            <span className="text-right font-bold">{leg.result !== 'pending' ? getGameScore(leg): ""} {legResultIcon(leg.result)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                        <span>Total odds: <span className="text-white font-semibold">{bet.totalOdds.toFixed(2)}x</span></span>
                        <span>Placed: <span className="text-white">{date}</span></span>
                        {totalStaked > 0 && (
                          <span>Staked: <span className="text-white font-semibold">{bet.stake.toLocaleString()} KP</span></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
