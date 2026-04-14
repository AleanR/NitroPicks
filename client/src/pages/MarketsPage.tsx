import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import StakeHandler from '../components/StakeHandler'
import { formatDate, formatTime, gameStarted } from '../helper/dateTimeFormat'
import GameTimer from '../components/Timer'

interface Bet {
  id: string
  gameId: string
  matchup: string
  marketType: string
  team: 'home' | 'away'
  selection: string
  odds: number
}

interface MarketGame {
  _id: string
  sport: string
  emoji: string
  homeTeam: string
  awayTeam: string
  status: string
  scoreHome: number
  scoreAway: number
  homeWin: { label: string, odds: number }
  awayWin: { label: string, odds: number }
  bettingClosesAt: string
}

function MarketsPage() {
  const [activeBets, setActiveBets] = useState<Bet[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  // Custom Dates
  const [selectedDateRange, setSelectedDateRange] = useState('')
  const [customDate, setCustomDate] = useState('')

  // FIX THIS PLEASE!!!!!!
  // Custom Sports
  const [selectedSports, setSelectedSports] = useState('')
  const [_sports, setSports] = useState<string[]>([])

  // Custom Status
  const [selectedStatus, setSelectedStatus] = useState('')
  const [_status, setStatus] = useState<string>('')

  const [games, setGames] = useState<MarketGame[]>([])
  const [loadinggames, setLoadinggames] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/games')
        if (res.ok) setGames(await res.json())
      } catch {
        // silently fall back to empty
      } finally {
        setLoadinggames(false)
      }
    }
    fetchGames()
  }, [])

  const todayISO = (() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const filteredGames = games.filter((game) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        game.homeTeam.toLowerCase().includes(query) ||
        game.awayTeam.toLowerCase().includes(query) ||
        `${game.homeTeam} vs ${game.awayTeam}`.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    if (selectedDateRange === 'custom' && customDate) {
      const [y, m, day] = customDate.split('-')
      const converted = formatDate(`${m}-${day}-${y.slice(2)}`)
      if (formatDate(game.bettingClosesAt) !== converted) return false
    }

    return true
  })

  const statusPriority: Record<string, number> = {
    live: 0,
    upcoming: 1,
    finished: 2,
  }

  const sortedFilteredGames = [...filteredGames].sort((a, b) => {
    const aPriority = statusPriority[a.status] ?? 99
    const bPriority = statusPriority[b.status] ?? 99

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    return new Date(a.bettingClosesAt).getTime() - new Date(b.bettingClosesAt).getTime()
  })

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDateRange('')
    setCustomDate('')


    // FIX THIS PLEASE
    setSelectedSports('')
    setSports([])
    setSelectedStatus('')
    setStatus('')
  }

  const handleAddToSlip = (
    game: MarketGame,
    marketType: string,
    team: 'home' | 'away',
    selection: string,
    odds: number,
  ) => {
    const newBet: Bet = {
      id: `${game._id}-${marketType}-${selection}`,
      gameId: game._id,
      matchup: `${game.homeTeam} vs ${game.awayTeam}`,
      marketType,
      team,
      selection,
      odds
    }

    setActiveBets((prev) => {
      const exactExists = prev.find((bet) => bet.id === newBet.id)

      if (exactExists) {
        return prev.filter((bet) => bet.id !== newBet.id)
      }

      const filteredPrev = prev.filter(
        (bet) => !(bet.gameId === game._id && bet.marketType === marketType)
      )

      return [...filteredPrev, newBet]
    })
  }

  const handleRemoveFromSlip = (betId: string) => {
    setActiveBets((prev) => prev.filter((bet) => bet.id !== betId))
  }

  const isBetAdded = (gameId: string, marketType: string, selection: string) => {
    return activeBets.some(
      (bet) =>
        bet.gameId === gameId &&
        bet.marketType === marketType &&
        bet.selection === selection
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[290px_minmax(0,1fr)_295px] min-h-screen">
        <aside className="h-fit rounded-3xl border border-zinc-800 bg-[#14161d] p-4">
          <h2 className="text-3xl font-extrabold">Filters</h2>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-bold">Date Range</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedDateRange('')}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedDateRange === ''
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-zinc-700 bg-[#181b22] text-white hover:border-zinc-600'
                  }`}
                >
                  All Games
                </button>

                {/* BY DATE */}
                <button
                  onClick={() => {
                    setSelectedDateRange('custom')
                    if (!customDate) setCustomDate(todayISO)
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedDateRange === 'custom'
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-zinc-700 bg-[#181b22] text-white hover:border-zinc-600'
                  }`}
                >
                  By Date
                </button>

                {selectedDateRange === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none [color-scheme:dark]"
                  />
                )}


                {/* BY SPORTS */}
                <button
                  onClick={() => {
                    setSelectedSports('custom')
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedDateRange === 'custom'
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-zinc-700 bg-[#181b22] text-white hover:border-zinc-600'
                  }`}
                >
                  By Sports
                </button>

                {/* ////////// FIX FOR SPORTS ////////////////////// */}
                {selectedSports === 'custom' && (
                  <div className='flex flex-col'>
                    <label className='p-2'>
                      <input
                        type='checkbox'
                        name='Basketball 🏀'
                        value="Basketball"
                        className='w-5 h-5 accent-blue-500'
                      />
                      <span>Basketball</span>
                    </label>
                    <label className='p-2'>
                      <input
                        type='checkbox'
                        value="Football"
                        className='w-5 h-5 accent-blue-500'
                      />
                      <span>Football</span>
                    </label>
                    <label className='p-2'>
                      <input
                        type='checkbox'
                        value="Soccer"
                        className='w-5 h-5 accent-blue-500'
                      />
                      <span>Soccer</span>
                    </label>
                  </div>
                )}
                
                {/* BY STATUS */}
                <button
                  onClick={() => {
                    setSelectedStatus('custom')
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedDateRange === 'custom'
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-zinc-700 bg-[#181b22] text-white hover:border-zinc-600'
                  }`}
                >
                  By Status
                </button>

                {selectedStatus === 'custom' && (
                  <div>
                    <label>
                      <input 
                      type="radio"
                      value="live"
                      name='status'
                      />
                      <span>Live</span>
                    </label>
                    <label>
                      <input 
                      type="radio"
                      value="cancelled"
                      name='status'
                      />
                      <span>Cancelled</span>
                    </label>
                    <label>
                      <input 
                      type="radio"
                      value="finished"
                      name='status'
                      />
                      <span>Finished</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="mt-6 w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black transition hover:bg-yellow-500"
          >
            Clear Filters
          </button>
        </aside>

        <section>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold">Markets</h1>
              <p className="mt-2 text-lg text-zinc-400">
                Showing 1-{Math.min(5, filteredGames.length)} of {filteredGames.length} games
              </p>
            </div>
          </div>

          <div className="mb-5 flex items-center rounded-xl border border-zinc-800 bg-[#0f1014] px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              className="mr-3 h-5 w-5 text-zinc-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search teams, games, matchups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-lg text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-5">
            {loadinggames ? (
              <div className="space-y-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[220px] rounded-3xl border border-zinc-800 bg-[#14161d] animate-pulse"
                  />
                ))}
              </div>
            ) : sortedFilteredGames.length === 0 ? (
              <p className="text-zinc-400">No games found.</p>
            ) : sortedFilteredGames.map((game) => (
              <div
                key={game._id}
                className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-5">
                    <div className="flex items-center gap-10">
                        <h3 className="text-2xl font-bold">{game.emoji}  {game.homeTeam}</h3>
                        {game.status === 'finished'
                        ? <span className='text-3xl font-bold'>{game.scoreHome}</span>
                        : ""}
                    </div>
                    <p className="text-base text-zinc-400">
                        {formatDate(game.bettingClosesAt)} • {formatTime(game.bettingClosesAt)}
                    </p>
                    <div className="flex items-center gap-10">
                      <h3 className="text-2xl font-bold">{game.emoji}   {game.awayTeam}</h3>
                      {game.status === 'finished'
                        ? <span className='text-3xl font-bold'>{game.scoreAway}</span>
                        : ""}
                    </div>
                  </div>

                  <span className={`rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-base font-semibold text-green-400 ${
                    game.status === 'upcoming'
                    ? 'border-green-500/40 bg-green-500/10 text-green-400'
                    : game.status === 'live' 
                    ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 animate-pulse'
                    : 'border-zinc-600 bg-zinc-700/20 text-zinc-400'
                  }`}>
                    {game.status === 'live' && gameStarted(game.bettingClosesAt)
                    ? <GameTimer startTime={game.bettingClosesAt}></GameTimer>
                    : game.status.toUpperCase()
                    }
                  </span>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToSlip(
                          game,
                          'moneyline',
                          'home',
                          game.homeWin.label,
                          game.homeWin.odds
                        )
                      }
                      className={`w-full rounded-xl border bg-[#181b22] px-4 py-3 text-left transition ${
                        isBetAdded(game._id, 'moneyline', game.homeWin.label)
                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                          : 'border-zinc-800 hover:border-yellow-400'
                      }`}
                    >
                      <p
                        className={`mb-2 text-sm ${
                          isBetAdded(game._id, 'moneyline', game.homeWin.label)
                            ? 'text-yellow-300'
                            : 'text-zinc-400'
                        }`}
                      >
                        Moneyline
                      </p>
                      <p className="font-semibold">{game.homeWin.label}</p>
                      <p
                        className={
                          isBetAdded(game._id, 'moneyline', game.homeWin.label)
                            ? 'text-yellow-300'
                            : 'text-zinc-400'
                        }
                      >
                        {game.homeWin.odds}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddToSlip(
                          game,
                          'moneyline',
                          'away',
                          game.awayWin.label,
                          game.awayWin.odds
                        )
                      }
                      className={`w-full rounded-xl border bg-[#181b22] px-4 py-3 text-left transition ${
                        isBetAdded(game._id, 'moneyline', game.awayWin.label)
                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                          : 'border-zinc-800 hover:border-yellow-400'
                      }`}
                    >
                      <p
                        className={`mb-2 text-sm ${
                          isBetAdded(game._id, 'moneyline', game.awayWin.label)
                            ? 'text-yellow-300'
                            : 'text-zinc-400'
                        }`}
                      >
                        Moneyline
                      </p>
                      <p className="font-semibold">{game.awayWin.label}</p>
                      <p
                        className={
                          isBetAdded(game._id, 'moneyline', game.awayWin.label)
                            ? 'text-yellow-300'
                            : 'text-zinc-400'
                        }
                      >
                        {game.awayWin.odds}
                      </p>
                    </button>
                  </div>

                  <div className="mt-5 flex items-center gap-5 text-base">
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-5 min-h-[500px]">
          <div className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-extrabold leading-tight">Active Mini Bet Slip</h2>
            </div>

            {activeBets.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xl text-zinc-300">No active bets</p>
                <p className="mt-2 text-sm text-zinc-400">Select markets to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between rounded-xl bg-black px-4 py-3"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{bet.matchup}</p>
                      <p className="text-sm text-zinc-400">
                        {bet.marketType} | {bet.selection}
                      </p>
                      <p className="text-sm text-yellow-400">{bet.odds}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromSlip(bet.id)}
                      className="ml-3 rounded-lg bg-red-500/20 p-1.5 text-red-400 transition hover:bg-red-500/40"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 L18 6 M6 6 l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeBets.length > 0 && (
              <StakeHandler
                activeBets={activeBets}
                onBetPlaced={() => setActiveBets([])}
              />
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
            <h3 className="mb-8 text-2xl font-extrabold">Quick Links</h3>

            <div className="space-y-4 text-xl">
              <button className="block font-semibold text-yellow-400">Deposit History</button>
              <button className="block font-semibold text-yellow-400">Betting History</button>
              <button className="block text-zinc-400">Support</button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default MarketsPage