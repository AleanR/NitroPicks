import { topUsers } from '../data/mockLeaderboardData'
import Navigation from '../components/Navigation'

function LeaderboardPage() {
  const topThree = topUsers.slice(0, 3)

  const getMedalIcon = (medal: 'gold' | 'silver' | 'bronze' | 'none') => {
    if (medal === 'gold') {
      return <span className="text-3xl text-yellow-400">🏆</span>
    }

    if (medal === 'silver') {
      return <span className="text-3xl text-zinc-300">🏅</span>
    }

    if (medal === 'bronze') {
      return <span className="text-3xl text-amber-500">🏅</span>
    }

    return null
  }

  const getRankDisplay = (user: (typeof topUsers)[number]) => {
    if (user.medal === 'gold') return <span className="text-yellow-400">🏆</span>
    if (user.medal === 'silver') return <span className="text-zinc-300">🏅</span>
    if (user.medal === 'bronze') return <span className="text-amber-500">🏅</span>
    return <span className="text-3xl font-bold text-slate-300">{user.rank}</span>
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-extrabold">Leaderboard</h1>
            <p className="mt-2 text-xl text-zinc-400">Top performers and leagues</p>
          </div>

          <button className="rounded-xl bg-yellow-400 px-6 py-4 text-lg font-bold text-black">
            Create League
          </button>
        </div>

        <section className="grid gap-5 lg:grid-cols-3">
          {topThree.map((user, index) => (
            <div
              key={user.id}
              className={`rounded-3xl border p-6 ${
                index === 0
                  ? 'border-yellow-500/40 bg-gradient-to-r from-[#3b2d00] via-[#1b1812] to-[#14161d]'
                  : 'border-zinc-800 bg-[#14161d]'
              }`}
            >
              <div className="mb-4 flex justify-center">{getMedalIcon(user.medal)}</div>

              <div className="text-center">
                <h2 className="text-4xl font-extrabold">{user.name}</h2>
                <p className="text-xl text-zinc-300">Rank #{user.rank}</p>
              </div>

              <div className="mt-6 rounded-2xl bg-black px-6 py-5 text-center">
                <p className="text-5xl font-extrabold text-yellow-400">{user.points}</p>
                <p className="mt-1 text-lg text-sky-300">Knight Points</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black px-4 py-4 text-center">
                  <p className="text-lg text-zinc-300">Win Rate</p>
                  <p className="text-3xl font-extrabold text-green-400">{user.winRate}%</p>
                </div>

                <div className="rounded-xl bg-black px-4 py-4 text-center">
                  <p className="text-lg text-zinc-300">Bets</p>
                  <p className="text-3xl font-extrabold">{user.bets}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="inline-flex rounded-2xl border border-zinc-800 bg-[#14161d] p-1">
            <button className="rounded-xl bg-[#1c2029] px-4 py-2 font-semibold text-white">
              Top Users
            </button>
            <button className="rounded-xl px-4 py-2 font-semibold text-zinc-400">
              Top Leagues
            </button>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-[#14161d]">
          <div className="grid grid-cols-[125px_1.6fr_1fr_1fr_1fr_1fr] border-b border-zinc-800 px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-300">
            <div>Rank</div>
            <div>User</div>
            <div>Points</div>
            <div>Win Rate</div>
            <div>Total Bets</div>
            <div>Action</div>
          </div>

          {topUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[125px_1.6fr_1fr_1fr_1fr_1fr] items-center border-b border-zinc-800 px-6 py-5 last:border-b-0"
            >
              <div>{getRankDisplay(user)}</div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-xl font-extrabold text-black">
                  {user.initials}
                </div>
                <p className="text-2xl font-bold">{user.name}</p>
              </div>

              <div className="text-2xl font-bold text-yellow-400">{user.points} KP</div>

              <div className="flex items-center gap-3">
                <div className="h-3 w-16 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-green-400"
                    style={{ width: `${user.winRate}%` }}
                  />
                </div>
                <span className="text-xl">{user.winRate}%</span>
              </div>

              <div className="text-2xl">{user.bets}</div>

              <div>
                <button className="rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-lg font-semibold text-white">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default LeaderboardPage