import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import StakeHandler from '../components/StakeHandler'

interface Bet {
  id: string
  eventId: string
  matchup: string
  marketType: string
  selection: string
  odds: string
}

interface MarketEvent {
  _id: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  status: string
  homeEmoji: string
  awayEmoji: string
  moneyline: {
    home: { label: string; odds: string }
    away: { label: string; odds: string }
  }
}

function MarketsPage() {
  const [activeBets, setActiveBets] = useState<Bet[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDateRange, setSelectedDateRange] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:8080/events')
        if (res.ok) setEvents(await res.json())
      } catch {
        // silently fall back to empty
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [])

  const todayISO = (() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const filteredEvents = events.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        event.homeTeam.toLowerCase().includes(query) ||
        event.awayTeam.toLowerCase().includes(query) ||
        `${event.homeTeam} vs ${event.awayTeam}`.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    if (selectedDateRange === 'custom' && customDate) {
      const [y, m, day] = customDate.split('-')
      const converted = `${m}-${day}-${y.slice(2)}`
      if (event.date !== converted) return false
    }

    return true
  })

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDateRange('')
    setCustomDate('')
  }

  const handleAddToSlip = (event: MarketEvent, marketType: string, selection: string, odds: string) => {
    const newBet: Bet = {
      id: `${event._id}-${marketType}-${selection}`,
      eventId: event._id,
      matchup: `${event.homeTeam} vs ${event.awayTeam}`,
      marketType,
      selection,
      odds
    }

    setActiveBets((prev) => {
      const exactExists = prev.find((bet) => bet.id === newBet.id)

      if (exactExists) {
        return prev.filter((bet) => bet.id !== newBet.id)
      }

      const filteredPrev = prev.filter(
        (bet) => !(bet.eventId === event._id && bet.marketType === marketType)
      )

      return [...filteredPrev, newBet]
    })
  }

  const handleRemoveFromSlip = (betId: string) => {
    setActiveBets((prev) => prev.filter((bet) => bet.id !== betId))
  }

  const isBetAdded = (eventId: string, marketType: string, selection: string) => {
    return activeBets.some(
      (bet) =>
        bet.eventId === eventId &&
        bet.marketType === marketType &&
        bet.selection === selection
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[290px_minmax(0,1fr)_295px]">
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
                Showing 1-{Math.min(5, filteredEvents.length)} of {filteredEvents.length} events
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
              placeholder="Search teams, events, matchups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-lg text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-5">
            {loadingEvents ? (
              <p className="text-zinc-400">Loading events...</p>
            ) : filteredEvents.length === 0 ? (
              <p className="text-zinc-400">No events found.</p>
            ) : filteredEvents.map((event) => (
              <div
                key={event._id}
                className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">{event.homeTeam}</h2>
                        <p className="text-base text-zinc-400">
                          {event.date} • {event.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-bold">{event.awayTeam}</h3>
                    </div>
                  </div>

                  <span className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-base font-semibold text-green-400">
                    {event.status}
                  </span>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToSlip(
                          event,
                          'moneyline',
                          event.moneyline.home.label,
                          event.moneyline.home.odds
                        )
                      }
                      className={`w-full rounded-xl border bg-[#181b22] px-4 py-3 text-left transition ${
                        isBetAdded(event._id, 'moneyline', event.moneyline.home.label)
                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                          : 'border-zinc-800 hover:border-yellow-400'
                      }`}
                    >
                      <p
                        className={`mb-2 text-sm ${
                          isBetAdded(event._id, 'moneyline', event.moneyline.home.label)
                            ? 'text-yellow-300'
                            : 'text-zinc-400'
                        }`}
                      >
                        Moneyline
                      </p>
                      <p className="font-semibold">{event.moneyline.home.label}</p>
                      <p
                        className={
                          isBetAdded(event._id, 'moneyline', event.moneyline.home.label)
                            ? 'text-yellow-300'
                            : 'text-zinc-400'
                        }
                      >
                        {event.moneyline.home.odds}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddToSlip(
                          event,
                          'moneyline',
                          event.moneyline.away.label,
                          event.moneyline.away.odds
                        )
                      }
                      className={`w-full rounded-xl border bg-[#181b22] px-4 py-3 text-left transition ${
                        isBetAdded(event._id, 'moneyline', event.moneyline.away.label)
                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                          : 'border-zinc-800 hover:border-yellow-400'
                      }`}
                    >
                      <p
                        className={`mb-2 text-sm ${
                          isBetAdded(event._id, 'moneyline', event.moneyline.away.label)
                            ? 'text-yellow-300'
                            : 'text-zinc-400'
                        }`}
                      >
                        Moneyline
                      </p>
                      <p className="font-semibold">{event.moneyline.away.label}</p>
                      <p
                        className={
                          isBetAdded(event._id, 'moneyline', event.moneyline.away.label)
                            ? 'text-yellow-300'
                            : 'text-zinc-400'
                        }
                      >
                        {event.moneyline.away.odds}
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

        <aside className="space-y-5">
          <div className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-extrabold leading-tight">Active Mini Bet Slip</h2>
            </div>

            {activeBets.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xl text-zinc-300">No active bets</p>
                <p className="mt-2 text-sm text-zinc-500">Select markets to get started</p>
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

            {activeBets.length > 0 && <StakeHandler activeBets={activeBets} />}
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