import { marketEvents } from '../data/mockMarketsData'

function MarketsPage() {
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

            <nav className="hidden items-center gap-8 md:flex">
              <a href="/home" className="font-medium text-white transition hover:text-yellow-400">
                Home
              </a>
              <a href="/markets" className="font-medium text-yellow-400">
                Markets
              </a>
                            <a href="/leaderboard" className="font-medium text-yellow-400">
                Leaderboard
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 rounded-xl border border-yellow-500/40 bg-[#0d0d0f] px-5 py-3 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-4 w-4 text-yellow-400"
              >
                <path d="M13 2L3 14h7v8l10-12h-7z" />
              </svg>
              <span className="text-xl font-bold">4,860</span>
              <span className="text-sm text-zinc-300">KP</span>
            </button>

            <button className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[290px_minmax(0,1fr)_295px]">
        <aside className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
          <h2 className="text-3xl font-extrabold">Filters</h2>

          <div className="mt-10 space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-bold">Sport</h3>
              <label className="flex items-center gap-3 text-lg">
                <input type="checkbox" defaultChecked className="accent-yellow-400" />
                Basketball
              </label>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-bold">Date Range</h3>
              <div className="space-y-3">
                <button className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-left text-lg">
                  Today (Mar 23rd)
                </button>
                <button className="w-full rounded-xl border border-zinc-800 bg-[#14161d] px-4 py-3 text-left text-lg text-zinc-400">
                  By Date(s)
                </button>
                <button className="w-full rounded-xl border border-zinc-800 bg-[#14161d] px-4 py-3 text-left text-lg text-zinc-400">
                  By Week(s)
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-bold">League</h3>
              <div className="space-y-4 text-lg">
                <label className="flex items-center gap-3">
                  <input type="radio" name="league" defaultChecked className="accent-yellow-400" />
                  NCAA
                </label>
                <label className="flex items-center gap-3 text-zinc-400">
                  <input type="radio" name="league" className="accent-yellow-400" />
                  ACC
                </label>
                <label className="flex items-center gap-3 text-zinc-400">
                  <input type="radio" name="league" className="accent-yellow-400" />
                  Big 12
                </label>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-bold">Market Type</h3>
              <div className="space-y-4 text-lg">
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
              <h3 className="mb-4 text-lg font-bold">Status</h3>
              <div className="space-y-4 text-lg">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="accent-yellow-400" />
                  Open
                </label>
                <label className="flex items-center gap-3 text-zinc-400">
                  <input type="checkbox" className="accent-yellow-400" />
                  Live
                </label>
                <label className="flex items-center gap-3 text-zinc-400">
                  <input type="checkbox" className="accent-yellow-400" />
                  Closed
                </label>
              </div>
            </div>
          </div>

          <button className="mt-12 w-full rounded-xl bg-yellow-400 px-6 py-4 text-lg font-bold text-black">
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
                    <div>
                      <p className="mb-2 text-sm text-zinc-400">Spread</p>
                      <div className="rounded-xl border border-zinc-800 bg-[#181b22] px-4 py-3">
                        <p className="font-semibold">{event.spread.label}</p>
                        <p className="text-zinc-400">{event.spread.odds}</p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-zinc-400">Moneyline</p>
                      <div className="rounded-xl border border-zinc-800 bg-[#181b22] px-4 py-3">
                        <p className="font-semibold">{event.moneyline.label}</p>
                        <p className="text-zinc-400">{event.moneyline.odds}</p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-zinc-400">Total</p>
                      <div className="rounded-xl border border-zinc-800 bg-[#181b22] px-4 py-3">
                        <p className="font-semibold">{event.total.label}</p>
                        <p className="text-zinc-400">{event.total.odds}</p>
                      </div>
                    </div>
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
            <div className="mb-16 flex items-start justify-between gap-4">
              <h2 className="text-3xl font-extrabold leading-tight">Active Mini Bet Slip</h2>
              <p className="text-right text-sm text-zinc-400">
                0
                <br />
                selections
              </p>
            </div>

            <div className="py-10 text-center">
              <p className="text-xl text-zinc-300">No active bets</p>
              <p className="mt-2 text-sm text-zinc-500">Select markets to get started</p>
            </div>
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