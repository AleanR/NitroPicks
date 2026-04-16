import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'

type TopUser = {
  id: string
  name: string
  initials: string
  rank: number
  points: string
  winRate: number
  bets: number
  medal: 'gold' | 'silver' | 'bronze' | 'none'
}

type SortKey = 'rank' | 'name' | 'points' | 'winRate' | 'bets'
type SortDir = 'asc' | 'desc'

function LeaderboardPage() {
  const navigate = useNavigate()
  const [leaderboardData, setLeaderboardData] = useState<TopUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/users/leaderboard')
        if (res.ok) {
          const data = await res.json()
          setLeaderboardData(data)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
    window.scrollTo(0, 0)
  }, [])

  const topThree = leaderboardData.slice(0, 3)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const sortedData = [...leaderboardData].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'rank')    cmp = a.rank - b.rank
    else if (sortKey === 'name')    cmp = a.name.localeCompare(b.name)
    else if (sortKey === 'points')  cmp = parseInt(a.points.replace(/,/g, '')) - parseInt(b.points.replace(/,/g, ''))
    else if (sortKey === 'winRate') cmp = a.winRate - b.winRate
    else if (sortKey === 'bets')    cmp = a.bets - b.bets
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="ml-1 text-zinc-600">↕</span>
    return <span className="ml-1 text-yellow-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

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

  const getRankDisplay = (user: TopUser) => {
    if (user.medal === 'gold') return <span className="text-yellow-400">🏆</span>
    if (user.medal === 'silver') return <span className="text-zinc-300">🏅</span>
    if (user.medal === 'bronze') return <span className="text-amber-500">🏅</span>
    return <span className="text-3xl font-bold text-slate-300">{user.rank}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <div className="h-12 w-64 animate-pulse rounded-xl bg-zinc-800" />
            <div className="mt-2 h-6 w-48 animate-pulse rounded-xl bg-zinc-800" />
          </div>

          <section className="grid gap-5 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[300px] animate-pulse rounded-3xl border border-zinc-800 bg-[#14161d]" />
            ))}
          </section>

          <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-[#14161d]">
            <div className="border-b border-zinc-800 px-6 py-5">
              <div className="h-5 w-full animate-pulse rounded-lg bg-zinc-800" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[72px] animate-pulse border-b border-zinc-800 px-6 last:border-b-0" />
            ))}
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-extrabold">Leaderboard</h1>
            <p className="mt-2 text-xl text-zinc-400">Top performers and leagues</p>
          </div>

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
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-[#14161d]">
          <div className="grid grid-cols-[125px_1.6fr_1fr_1fr_1fr_1fr] border-b border-zinc-800 px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-300">
            {(['rank', 'name', 'points', 'winRate', 'bets'] as SortKey[]).map((col) => (
              <button
                key={col}
                onClick={() => handleSort(col)}
                className="flex items-center text-left hover:text-yellow-400 transition"
              >
                {col === 'rank' ? 'Rank' : col === 'name' ? 'User' : col === 'points' ? 'Points' : col === 'winRate' ? 'Win Rate' : 'Total Bets'}
                <SortIcon col={col} />
              </button>
            ))}
            <div>Action</div>
          </div>

          {sortedData.map((user) => (
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
                <button
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-lg font-semibold text-white hover:border-yellow-400 transition"
                >
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