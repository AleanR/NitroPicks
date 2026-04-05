import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'

interface PublicUser {
  _id: string
  firstname: string
  lastname: string
  username: string
  major: string
  pointBalance: number
  createdAt: string
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/users/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then((data) => { if (data) setUser(data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6 h-5 w-40 animate-pulse rounded-lg bg-zinc-800" />
          <div className="grid gap-6 lg:grid-cols-2 lg:max-w-3xl">
            <div className="h-[420px] animate-pulse rounded-3xl border border-zinc-800 bg-[#14161d]" />
            <div className="h-[420px] animate-pulse rounded-3xl border border-zinc-800 bg-[#14161d]" />
          </div>
        </main>
      </div>
    )
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
          <p className="text-2xl font-bold">User not found</p>
          <button
            onClick={() => navigate('/leaderboard')}
            className="mt-6 rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black hover:bg-yellow-300 transition"
          >
            Back to Leaderboard
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <button
          onClick={() => navigate('/leaderboard')}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition"
        >
          ← Back to Leaderboard
        </button>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* Left — profile card */}
          <section className="h-fit rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="black"
                  className="h-12 w-12"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
                  />
                </svg>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold">
                {user.firstname} {user.lastname}
              </h1>
              <p className="mt-1 text-base font-semibold text-sky-300">@{user.username}</p>
              <p className="mt-1 text-base text-zinc-400">{user.major}</p>
              <p className="mt-2 text-base text-zinc-500">Member since {memberSince}</p>
            </div>

            <div className="my-8 border-t border-zinc-800" />

            <div className="rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-[#2b2208] to-[#1a1a1f] p-5">
              <div className="mb-3">
                <p className="text-sm text-zinc-400">Current Balance</p>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-yellow-400"
                  aria-hidden="true"
                >
                  <path d="M13 2L3 14h7v8l10-12h-7z" />
                </svg>
                <p className="text-4xl font-extrabold">{user.pointBalance.toLocaleString()}</p>
                <span className="text-xl text-zinc-300">KP</span>
              </div>
            </div>
          </section>

          {/* Right — recent bets */}
          <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
            <h2 className="mb-2 text-3xl font-extrabold">Recent Bets</h2>
            <p className="mb-6 text-sm text-zinc-400">Showing last 5 entries</p>

            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-xl text-zinc-300">No bet history yet</p>
              <p className="mt-2 text-sm text-zinc-500">Bet history will appear here once available.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
