import { statCards, upcomingGames, winners } from '../data/mockHomeData'

function HomePage() {
  const renderStatIcon = (icon: 'leagues' | 'points' | 'wins') => {
    if (icon === 'leagues') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          className="h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.742-.479 3 3 0 00-4.682-2.72m.94 3.198v.75A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 18.75V18m12 0a5.966 5.966 0 00-1.5-3.975M6 18a5.966 5.966 0 011.5-3.975m0 0a3 3 0 115 0m-5 0a3 3 0 015 0"
          />
        </svg>
      )
    }

    if (icon === 'points') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          className="h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18L9 11.25l4.5 4.5L21.75 7.5"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h5.25v5.25" />
        </svg>
      )
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.8"
        stroke="currentColor"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 18.75h-9a.75.75 0 01-.75-.75V15h10.5v3a.75.75 0 01-.75.75z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 15V6.75h7.5V15M18 6.75h1.5A1.5 1.5 0 0121 8.25v.75A3.75 3.75 0 0117.25 12h-.5M6 6.75H4.5A1.5 1.5 0 003 8.25v.75A3.75 3.75 0 006.75 12h.5"
        />
      </svg>
    )
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

            <nav className="hidden items-center gap-8 md:flex">
              <a href="/home" className="font-medium text-yellow-400">
                Home
              </a>
              <a href="/markets" className="font-medium text-white transition hover:text-yellow-400">
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

      <main className="mx-auto max-w-7xl px-6 py-6">
        <section className="grid gap-8 rounded-3xl border border-zinc-800 bg-gradient-to-r from-[#0f1117] to-black px-8 py-8 md:grid-cols-2 md:px-10 md:py-10">
          <div className="flex flex-col justify-center">
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
              Simulated Betting for UCF Games — Use Virtual Points, Compete with Knights
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              Play risk-free with virtual points to predict outcomes of UCF sporting events.
              Best leagues with friends, climb leaderboards, and redeem rewards for campus perks.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black">
                Get Started
              </button>
              <button className="rounded-xl border border-zinc-700 bg-[#111216] px-6 py-3 font-semibold text-yellow-400">
                Browse Events
              </button>
              <button className="rounded-xl border border-zinc-700 bg-[#111216] px-6 py-3 font-semibold text-white">
                Create a League
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex h-[320px] w-full items-center justify-center rounded-2xl bg-zinc-200 text-center text-xl font-semibold text-zinc-500 shadow-xl md:h-[360px]">
              Placeholder Hero Image
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.id} className="rounded-3xl border border-zinc-800 bg-[#12141b] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
                  {renderStatIcon(card.icon)}
                </div>

                <div>
                  <p className="text-5xl font-extrabold">{card.value}</p>
                  <p className="text-lg text-zinc-300">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[2.2fr_1.05fr]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-5xl font-extrabold">Upcoming Marquee Games</h2>
              <button className="flex items-center gap-2 text-xl font-semibold text-yellow-400">
                View All
                <span>→</span>
              </button>
            </div>

            <div className="space-y-5">
              {upcomingGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-[#14161d] px-6 py-6"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-extrabold text-black">
                      UCF
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold">{game.title}</h3>
                      <p className="mt-1 text-xl text-zinc-400">
                        {game.date} • {game.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {game.status === 'open' ? (
                      <>
                        <span className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-lg font-semibold text-green-400">
                          Market Open
                        </span>
                        <button className="rounded-xl bg-yellow-400 px-5 py-3 text-lg font-bold text-black">
                          View Market
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="rounded-full border border-zinc-600 bg-zinc-700/20 px-4 py-2 text-lg font-semibold text-zinc-400">
                          Market Closed
                        </span>
                        <button className="rounded-xl bg-zinc-700 px-5 py-3 text-lg font-bold text-zinc-400">
                          View Market
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-4xl font-extrabold">Recent Winners</h2>
                <span className="text-yellow-400">🏆</span>
              </div>

              <div className="rounded-3xl border border-yellow-500/40 bg-[#120f05] p-6">
                <p className="mb-6 text-lg text-zinc-300">Continued by top performers</p>

                <div className="space-y-6">
                  {winners.map((winner, index) => (
                    <div key={winner.id}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 font-extrabold text-black">
                            {winner.initials}
                          </div>

                          <div>
                            <p className="text-2xl font-bold">{winner.name}</p>
                            <p className="text-base text-zinc-400">{winner.subtitle}</p>
                          </div>
                        </div>

                        <p className="text-2xl font-extrabold text-yellow-400">{winner.points}</p>
                      </div>

                      {index !== winners.length - 1 && (
                        <div className="mt-6 border-b border-zinc-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
              <h3 className="text-4xl font-extrabold">How Points Work</h3>

              <div className="mt-6 space-y-5 text-lg leading-8 text-zinc-300">
                <p>
                  <span className="font-bold text-yellow-400">🎁 Bonus:</span> 5,000 free points
                  when you join! Sign In.
                </p>
                <p>
                  <span className="font-bold text-yellow-400">🤝 Wager:</span> Place bets on games
                  on available markets — match versus, spread of betting.
                </p>
                <p>
                  <span className="font-bold text-yellow-400">🏀 Predict:</span> Collect and catch
                  leaderboards, redeem for campus perks!
                </p>
              </div>

              <button className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 text-lg font-bold text-black">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage