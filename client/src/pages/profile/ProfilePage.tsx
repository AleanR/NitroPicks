import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import ProfileHeader from './components/ProfileHeader'
import BalancePanel from './components/BalancePanel'
import StatsPanel from './components/StatsPanel'
import UCFInfoPanel from './components/UCFInfoPanel'
import SecurityPanel from './components/SecurityPanel'
import EditProfileModal from './components/EditProfileModal'

type User = {
  _id: string
  firstname: string
  lastname: string
  username: string
  email: string
  major: string
  ucfID: string
  knightPoints: number
  createdAt: string
  isVerified: boolean
}

type BetStats = {
  total: number
  won: number
  lost: number
}

type ProfileTab = 'info' | 'ucf' | 'security'

function LoadingSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-4">
        {[380, 160, 180].map((h) => (
          <div key={h} className={`h-[${h}px] animate-pulse rounded-3xl border border-zinc-800 bg-[#14161d]`} style={{ height: h }} />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-12 w-64 animate-pulse rounded-2xl border border-zinc-800 bg-[#14161d]" />
        <div className="h-96 animate-pulse rounded-3xl border border-zinc-800 bg-[#14161d]" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<BetStats>({ total: 0, won: 0, lost: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ProfileTab>('info')
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch user profile
        const userRes = await fetch('/api/users/me', { credentials: 'include' })
        if (userRes.status === 401) { navigate('/login'); return }
        if (!userRes.ok) throw new Error('Failed to load profile')
        const userData = await userRes.json()
        setUser(userData)

        // Fetch bet stats
        try {
          const betsRes = await fetch('/api/bets/my/list', { credentials: 'include' })
          if (betsRes.ok) {
            const bets: any[] = await betsRes.json()
            const won  = bets.filter((b) => b.status === 'win').length
            const lost = bets.filter((b) => b.status === 'lose').length
            setStats({ total: bets.length, won, lost })
          }
        } catch {
          // Non-critical — stats just show 0
        }
      } catch {
        setError('Unable to load profile. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await fetch('/api/users/auth/logout', { method: 'POST', credentials: 'include' })
    } catch { /* ignore */ }
    navigate('/')
  }

  const tabClass = (tab: ProfileTab) =>
    `rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
      activeTab === tab
        ? 'bg-[#1c2029] text-white'
        : 'text-zinc-400 hover:text-white'
    }`

  if (loading) return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <LoadingSkeleton />
    </div>
  )

  if (error || !user) return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl font-bold text-zinc-300">{error ?? 'Something went wrong.'}</p>
        <button
          onClick={() => navigate('/login')}
          className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black"
        >
          Go to Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4">
          <ProfileHeader
            user={user}
            onEditClick={() => setEditOpen(true)}
            onLogout={handleLogout}
          />
          <BalancePanel knightPoints={user.knightPoints} />
          <StatsPanel totalBets={stats.total} won={stats.won} lost={stats.lost} />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">
          {/* Tab bar */}
          <div className="inline-flex rounded-2xl border border-zinc-800 bg-[#14161d] p-1">
            <button className={tabClass('info')}     onClick={() => setActiveTab('info')}>
              Profile Info
            </button>
            <button className={tabClass('ucf')}      onClick={() => setActiveTab('ucf')}>
              UCF Info
            </button>
            <button className={tabClass('security')} onClick={() => setActiveTab('security')}>
              Security
            </button>
          </div>

          {activeTab === 'info' && (
            <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Profile Information</h2>
                  <p className="mt-1 text-sm text-zinc-500">Your public-facing account details</p>
                </div>
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Edit
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="First Name"  value={user.firstname} />
                <Field label="Last Name"   value={user.lastname} />
                <Field label="Username"    value={user.username} />
                <Field label="UCF Email"   value={user.email} />
              </div>
            </section>
          )}

          {activeTab === 'ucf' && <UCFInfoPanel user={user} />}
          {activeTab === 'security' && <SecurityPanel isVerified={user.isVerified} />}
        </div>
      </main>

      {/* Edit modal */}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setUser(updated)
            setEditOpen(false)
          }}
        />
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <div className="rounded-xl border border-zinc-800 bg-[#0d0d0f] px-4 py-3 text-sm text-zinc-300">
        {value || '—'}
      </div>
    </div>
  )
}
