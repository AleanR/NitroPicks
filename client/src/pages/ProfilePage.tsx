import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import {
  weeklyProgress,
  recentTransactions,
} from '../data/mockProfileData'

type ProfileTab = 'profile' | 'security'

function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const maxValue = 600

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setLoading(false)
        } else if (response.status === 401) {
          navigate('/login')
        } else {
          const errorText = await response.text()
          setError(`Error fetching user: ${response.status} ${errorText}`)
          setLoading(false)
        }
      } catch (fetchError) {
        setError('Unable to load profile. Please check your connection.')
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const tabClass = (tab: ProfileTab) =>
    `rounded-xl px-4 py-2 font-semibold transition ${
      activeTab === tab ? 'bg-[#1c2029] text-white' : 'text-zinc-400 hover:text-white'
    }`

  const fullName = user ? `${user.firstname} ${user.lastname}` : ''
  const balance = user?.knightPoints != null ? Math.round(user.knightPoints) : undefined
  const school = user?.major ?? 'University of Central Florida'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown'

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[400px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="h-[420px] animate-pulse rounded-3xl border border-zinc-800 bg-[#14161d]" />
            <div className="h-[360px] animate-pulse rounded-3xl border border-zinc-800 bg-[#14161d]" />
          </div>
          <div className="space-y-6">
            <div className="h-[48px] w-[380px] animate-pulse rounded-2xl border border-zinc-800 bg-[#14161d]" />
            <div className="h-[500px] animate-pulse rounded-3xl border border-zinc-800 bg-[#14161d]" />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex h-screen max-w-7xl flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-2xl font-bold">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="black"
                  className="h-12 w-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
                  />
                </svg>
              </div>

              <h1 className="mt-5 text-5xl font-extrabold">{fullName}</h1>
              <p className="mt-2 text-xl text-sky-200">{school}</p>
              <p className="mt-3 text-base text-zinc-400">Member since {memberSince}</p>
            </div>

            <div className="my-8 border-t border-zinc-800" />

            <div className="rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-[#2b2208] to-[#1a1a1f] p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-lg text-zinc-300">Current Balance</p>
                <span className="text-yellow-400">🏆</span>
              </div>

              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-yellow-400"
                >
                  <path d="M13 2L3 14h7v8l10-12h-7z" />
                </svg>
                <p className="text-5xl font-extrabold">{balance}</p>
                <span className="text-3xl text-zinc-300">KP</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black p-4">
                <p className="text-base text-zinc-400">Total Bets</p>
                <p className="mt-2 text-4xl font-extrabold">{user?.totalBets ?? 0}</p>
              </div>

              <div className="rounded-2xl bg-black p-4">
                <p className="text-base text-zinc-400">Win Rate</p>
                <p className="mt-2 text-4xl font-extrabold text-green-400">
                  {user?.winRate ?? 0}%
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
            <h2 className="flex items-center gap-2 text-3xl font-extrabold">
              <span className="text-yellow-400">⚡</span>
              Wallet & Points
            </h2>

            <div className="mt-10 rounded-2xl bg-black p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-lg text-zinc-300">KP Balance (Knight Points)</p>
                <p className="text-3xl font-extrabold text-yellow-400">
                  {balance} KP
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/redeem-points')}
              className="mt-3 w-full rounded-xl border border-zinc-800 bg-[#181b22] px-6 py-4 text-lg font-bold text-yellow-400 hover:border-yellow-400 transition"
            >
              Redeem Rewards
            </button>

            <div className="mt-6 border-t border-zinc-800 pt-6">
              <h3 className="text-xl font-bold">Recent Transactions</h3>
              <p className="mt-2 text-sm text-zinc-400">Showing last 4 entries</p>

              <div className="mt-6 space-y-5">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          transaction.type === 'positive'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {transaction.type === 'positive' ? '↑' : '↓'}
                      </div>

                      <div>
                        <p className="font-semibold text-white">{transaction.title}</p>
                        <p className="text-sm text-zinc-400">{transaction.date}</p>
                      </div>
                    </div>

                    <p
                      className={`font-bold ${
                        transaction.type === 'positive' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {transaction.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="inline-flex rounded-2xl border border-zinc-800 bg-[#14161d] p-1">
            <button className={tabClass('profile')} onClick={() => setActiveTab('profile')}>
              Profile Information
            </button>
            <button className={tabClass('security')} onClick={() => setActiveTab('security')}>
              Security
            </button>
          </div>

          {activeTab === 'profile' && (
            <>
              <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
                <div className="mb-8">
                  <h2 className="text-4xl font-extrabold">Profile Information</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="profile-fullname" className="mb-2 block text-lg font-semibold">Full Name</label>
                    <input
                      id="profile-fullname"
                      value={fullName}
                      readOnly
                      className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-lg text-zinc-300 outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-username" className="mb-2 block text-lg font-semibold">Username</label>
                    <input
                      id="profile-username"
                      value={user?.username ?? ''}
                      readOnly
                      className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-lg text-zinc-300 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="profile-email" className="mb-2 block text-lg font-semibold">UCF Email</label>
                  <input
                    id="profile-email"
                    value={user?.email ?? ''}
                    readOnly
                    className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-lg text-zinc-300 outline-none"
                  />
                </div>

                <div className="mt-6">
                  <label htmlFor="profile-major" className="mb-2 block text-lg font-semibold">Major</label>
                  <input
                    id="profile-major"
                    value={school}
                    readOnly
                    className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-lg text-zinc-300 outline-none"
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
                <h2 className="mb-8 flex items-center gap-2 text-4xl font-extrabold">
                  <span className="text-yellow-400">↗</span>
                  Weekly Betting Progress
                </h2>

                <div className="rounded-2xl bg-[#181b22] p-6">
                  <div className="flex h-[320px] items-end gap-5 border-b-2 border-l-2 border-zinc-600 px-4 pt-2">
                    {weeklyProgress.map((item) => (
                      <div
                        key={item.day}
                        className="flex flex-1 flex-col items-center justify-end gap-3"
                      >
                        <div
                          className="w-full max-w-[80px] rounded-t-xl bg-yellow-400"
                          style={{ height: `${(item.value / maxValue) * 100}%` }}
                        />
                        <span className="pb-2 text-lg text-slate-400">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </>
          )}

          {activeTab === 'security' && (
            <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
              <h2 className="mb-8 text-4xl font-extrabold">Security</h2>

              <div className="space-y-6">
                <div className="rounded-2xl bg-black px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">Password</h3>
                      <p className="mt-1 text-lg text-zinc-400">Send a reset link to your email</p>
                    </div>

                    <button
                      onClick={() => navigate('/forgot-password')}
                      className="rounded-xl border border-zinc-700 bg-[#181b22] px-5 py-3 font-semibold text-white hover:border-yellow-400 transition"
                    >
                      Reset password
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
            <h2 className="mb-6 text-4xl font-extrabold">Help & Support</h2>
            <button className="w-full rounded-xl border border-zinc-800 bg-[#181b22] px-4 py-4 text-left text-lg font-semibold text-white hover:border-yellow-400 transition">
              Contact Support
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
