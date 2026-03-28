import { marketEvents } from '../data/mockMarketsData'
import Navigation from '../components/Navigation'
import StakeHandler from '../components/StakeHandler'
import { useState } from 'react'

interface Bet {
  id: string
  eventId: number
  matchup: string
  marketType: string
  selection: string
  odds: string
}

function MarketsPage() {
  const [activeBets, setActiveBets] = useState<Bet[]>([])

  const handleAddToSlip = (event: any, marketType: string, selection: string, odds: string) => {
    const newBet: Bet = {
      id: `${event.id}-${marketType}`,
      eventId: event.id,
      matchup: `${event.homeTeam} vs ${event.awayTeam}`,
      marketType,
      selection,
      odds
    }

    setActiveBets((prev) => {
      const exists = prev.find(
        bet => bet.eventId === event.id && bet.marketType === marketType
      )

      if (exists) {
        return prev.map(bet =>
          bet.eventId === event.id && bet.marketType === marketType
            ? newBet
            : bet
        )
      }

      return [...prev, newBet]
    })
  }

  const handleRemoveFromSlip = (betId: string) => {
    setActiveBets((prev) => prev.filter((bet) => bet.id !== betId))
  }

  const isBetAdded = (eventId: number, marketType: string) => {
    return activeBets.some(bet => bet.eventId === eventId && bet.marketType === marketType)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#111216]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="black"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path d="M13 2L3 14h7v8l10-12h-7z" />
                </svg>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold tracking-tight">NitroPicks</span>
              </div>
            </div>

            <Navigation />
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="rounded-xl border border-zinc-700 px-5 py-2 font-semibold text-white hover:border-yellow-400"
            >
              Sign In
            </a>

            <a
              href="/register"
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[290px_minmax(0,1fr)_295px]">
        <aside className="h-fit rounded-3xl border border-zinc-800 bg-[#14161d] p-4">
          <h2 className="text-3xl font-extrabold">Filters</h2>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-bold">Date Range</h3>
              <div className="space-y-2">
                <button className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-3 py-2 text-left text-sm">
                  Today (Mar 23rd)
                </button>
                <button className="w-full rounded-xl border border-zinc-800 bg-[#14161d] px-3 py-2 text-left text-sm text-zinc-400">
                  By Date(s)
                </button>
                <button className="w-full rounded-xl border border-zinc-800 bg-[#14161d] px-3 py-2 text-left text-sm text-zinc-400">
                  By Week(s)
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-bold">Market Type</h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-3 text-zinc-400">
                  <input type="radio" name="marketType" className="accent-yellow-400" />
                  Spread
                </label>
                <label className="flex items-center gap-3 text-zinc-400">
                  <input type="radio" name="marketType" className="accent-yellow-400" />
                  Money Line
                </label>
                <label className="flex items-center gap-3 text-zinc-400">
                  <input type="radio" name="marketType" className="accent-yellow-400" />
                  Total (O/U)
                </label>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-bold">Status</h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="accent-yellow-400" />
                  Open
                </label>
                <label className="flex items-center gap-3 text-zinc-400">
                  <input type="checkbox" className="accent-yellow-400" />
                  Closed
                </label>
              </div>
            </div>
          </div>

          <button className="mt-6 w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black">
            Apply Filters
          </button>
        </aside>

        <section>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold">Markets</h1>
              <p className="mt-2 text-lg text-zinc-400">Showing 1-5 of 32 events</p>
            </div>

            <button className="rounded-xl border border-zinc-700 bg-[#101216] px-6 py-3 text-lg font-semibold">
              Load More Events
            </button>
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
              className="w-full bg-transparent text-lg text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-5">
            {marketEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{event.homeEmoji}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{event.homeTeam}</h2>
                        <p className="text-base text-zinc-400">
                          {event.date} • {event.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{event.awayEmoji}</span>
                      <h3 className="text-2xl font-bold">{event.awayTeam}</h3>
                    </div>
                  </div>

                  <span className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-base font-semibold text-green-400">
                    {event.status}
                  </span>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToSlip(
                          event,
                          'spread',
                          event.spread.label,
                          event.spread.odds
                        )
                      }
                      className={`w-full rounded-xl border bg-[#181b22] px-4 py-3 text-left transition ${
                        isBetAdded(event.id, 'spread')
                          ? 'border-yellow-400'
                          : 'border-zinc-800 hover:border-yellow-400'
                      }`}
                    >
                      <p className="mb-2 text-sm text-zinc-400">Spread</p>
                      <p className="font-semibold">{event.spread.label}</p>
                      <p className="text-zinc-400">{event.spread.odds}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddToSlip(
                          event,
                          'moneyline',
                          event.moneyline.label,
                          event.moneyline.odds
                        )
                      }
                      className={`w-full rounded-xl border bg-[#181b22] px-4 py-3 text-left transition ${
                        isBetAdded(event.id, 'moneyline')
                          ? 'border-yellow-400'
                          : 'border-zinc-800 hover:border-yellow-400'
                      }`}
                    >
                      <p className="mb-2 text-sm text-zinc-400">Moneyline</p>
                      <p className="font-semibold">{event.moneyline.label}</p>
                      <p className="text-zinc-400">{event.moneyline.odds}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddToSlip(
                          event,
                          'total',
                          event.total.label,
                          event.total.odds
                        )
                      }
                      className={`w-full rounded-xl border bg-[#181b22] px-4 py-3 text-left transition ${
                        isBetAdded(event.id, 'total')
                          ? 'border-yellow-400'
                          : 'border-zinc-800 hover:border-yellow-400'
                      }`}
                    >
                      <p className="mb-2 text-sm text-zinc-400">Total</p>
                      <p className="font-semibold">{event.total.label}</p>
                      <p className="text-zinc-400">{event.total.odds}</p>
                    </button>
                  </div>

                  <div className="mt-5 flex items-center gap-5 text-base">
                    <button className="font-semibold text-yellow-400">↗ See Stats</button>
                    <button className="text-zinc-400">○ Details</button>
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 L18 6 M6 6 l12 12" />
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