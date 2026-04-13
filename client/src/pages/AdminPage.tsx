import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { formatDate, formatEditDate, formatTime } from '../helper/dateFormat'

interface Form {
  sport: string
  _id?: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  emoji: string
  homeOdds: string
  awayOdds: string
}

interface Game {
  _id: string
  sport: string
  homeTeam: string
  awayTeam: string
  status: string
  winner: string
  scoreHome: number
  scoreAway: number
  homeWin: { label: string, odds: number }
  awayWin: { label: string, odds: number }
  emoji: string
  bettingClosesAt: string
  date: string
  time: string
}

const EMPTY_FORM: Form = {
  sport: '',
  homeTeam: '',
  awayTeam: '',
  date: '',
  time: '',
  emoji: 'Basketball 🏀',
  homeOdds: '1.90',
  awayOdds: '1.90',
}

function AdminPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Game result state
  const [games, setGames] = useState<Game[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [resolveWinner, setResolveWinner] = useState<'home' | 'away' | 'tie' | ''>('')
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null)

  // Guard: redirect if not admin
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (!res.ok) { navigate('/login'); return; }
        const data = await res.json()
        if (!data.isAdmin) { navigate('/'); return; }
      } catch {
        navigate('/login')
      }
    }
    check()
  }, [navigate])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/games', { credentials: 'include' })
      if (res.ok) setEvents(await res.json())
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/games/all', { credentials: 'include' })
      if (res.ok) setGames(await res.json())
    } catch {
      // non-critical
    } finally {
      setGamesLoading(false)
    }
  }

  useEffect(() => { fetchGames() }, [])

  const handleResolveGame = async (gameId: string) => {
    if (!resolveWinner) return
    setResolveError(null)
    setResolveSuccess(null)
    try {
      const res = await fetch(`/api/games/${gameId}/end`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: resolveWinner }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to resolve game')
      }
      setResolveSuccess('Game resolved successfully — bets have been settled.')
      setResolvingId(null)
      setResolveWinner('')
      await fetchGames()
    } catch (e: any) {
      setResolveError(e.message)
    }
  }

  const handleChange = (field: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // const toDateInput = (mmddyy: string) => {
  //   if (!mmddyy || !mmddyy.includes('-')) return ''
  //   const [mm, dd, yy] = mmddyy.split('-')
  //   return `20${yy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  // }

  // const fromDateInput = (iso: string) => {
  //   if (!iso || !iso.includes('-')) return ''
  //   const [y, m, d] = iso.split('-')
  //   return `${m}-${d}-${y.slice(2)}`
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const url = editingId
        ? `/api/games/${editingId}`
        : '/api/games'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setForm(EMPTY_FORM)
      setEditingId(null)
      await fetchEvents()
    } catch {
      setError('Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (event: Game) => {
    setEditingId(event._id)
    setForm({
      sport: event.sport,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      date: formatEditDate(event.bettingClosesAt),
      time: formatTime(event.bettingClosesAt),
      emoji: `${event.sport} ${event.emoji}`,
      homeOdds: String(event.homeWin.odds) ?? '1.90',
      awayOdds: String(event.awayWin.odds) ?? '1.90',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this event?')) return
    try {
      await fetch(`api/games/${id}/cancel`, {
        method: "DELETE",
        credentials: 'include',
      })
      await fetchEvents()
    } catch {
      setError('Failed to cancel event')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await fetch(`/api/games/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      await fetchEvents()
    } catch {
      setError('Failed to delete event')
    }
  }

  const handleStatusToggle = async (event: any) => {
    const nextStatus = event.status === '🏀' ? '🏈' : '⚽'
    try {
      await fetch(`/api/admin/events/${event._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      await fetchEvents()
    } catch {
      setError('Failed to update status')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" className="h-6 w-6">
              <path d="M13 2L3 14h7v8l10-12h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold">Admin Panel</h1>
            <p className="text-zinc-400">Manage events and markets</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* CREATE / EDIT FORM */}
        <section className="mb-10 rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
          <h2 className="mb-6 text-2xl font-extrabold">
            {editingId ? 'Edit Event' : 'Create New Event'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-300">Home Team</label>
                <input
                  required
                  value={form.homeTeam}
                  onChange={e => handleChange('homeTeam', e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  placeholder="UCF Knights"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-300">Away Team</label>
                <input
                  required
                  value={form.awayTeam}
                  onChange={e => handleChange('awayTeam', e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  placeholder="South Florida Bulls"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-300">Start Date</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-white outline-none focus:border-yellow-400 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-300">Start Time</label>
                <input
                  required
                  value={form.time}
                  onChange={e => handleChange('time', e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-white outline-none focus:border-yellow-400"
                  placeholder="7:00 PM"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-300">Emoji</label>
                <select
                  value={form.emoji}
                  onChange={e => handleChange('emoji', e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-white outline-none focus:border-yellow-400"
                >
                  <option value="Basketball 🏀">🏀</option>
                  <option value="Football 🏈">🏈</option>
                  <option value="Soccer ⚽">⚽</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-300">
                  Home Odds (decimal, e.g. 1.75)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={form.homeOdds}
                  onChange={e => handleChange('homeOdds', e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-300">
                  Away Odds (decimal, e.g. 2.10)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={form.awayOdds}
                  onChange={e => handleChange('awayOdds', e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-500 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setForm(EMPTY_FORM); setEditingId(null) }}
                  className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 hover:border-white transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* EVENT LIST */}
        <section>
          <h2 className="mb-5 text-2xl font-extrabold">All Events</h2>

          {loading ? (
            <p className="text-zinc-400">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-zinc-400">No events yet. Create one above.</p>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event._id} className="rounded-3xl border border-zinc-800 bg-[#14161d] px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xl font-bold">
                        {event.emoji} {event.homeTeam} vs {event.emoji} {event.awayTeam}
                      </p>
                      <p className="mt-1 text-zinc-400">{formatDate(event.bettingClosesAt)} • {formatTime(event.bettingClosesAt)}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Home: {event.homeWin.odds || '—'} &nbsp;|&nbsp; Away: {event.awayWin.odds || '—'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        // onClick={() => handleStatusToggle(event)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                            event.status === 'live'
                            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 animate-pulse'
                            : 'border-zinc-600 bg-zinc-700/20 text-zinc-400 hover:bg-zinc-700/40'
                        }`}
                      >
                        {event.status.toLocaleUpperCase()}
                      </button>

                      <button
                        onClick={() => handleEdit(event)}
                        className="rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white hover:border-yellow-400 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleCancel(event._id)}
                        className="rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white hover:border-red-500 transition"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => handleDelete(event._id)}
                        className="rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-red-400 hover:border-red-500 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* RESOLVE GAMES */}
        <section className="mt-12">
          <h2 className="mb-2 text-2xl font-extrabold">Resolve Games</h2>
          <p className="mb-5 text-sm text-zinc-400">
            Set the outcome for a game to settle all pending bets.
          </p>

          {resolveError && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-400">
              {resolveError}
            </div>
          )}
          {resolveSuccess && (
            <div className="mb-4 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-green-400">
              {resolveSuccess}
            </div>
          )}

          {gamesLoading ? (
            <p className="text-zinc-400">Loading games...</p>
          ) : games.filter(g => g.status !== 'finished' && g.status !== 'cancelled').length === 0 ? (
            <p className="text-zinc-400">No unresolved games.</p>
          ) : (
            <div className="space-y-4">
              {games
                .filter(g => g.status !== 'finished' && g.status !== 'cancelled')
                .map(game => (
                  <div key={game._id} className="rounded-3xl border border-zinc-800 bg-[#14161d] px-6 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xl font-bold">
                          {game.homeTeam} <span className="text-zinc-500">vs</span> {game.awayTeam}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          Closes: {formatDate(game.bettingClosesAt.toString())} • {formatTime(game.bettingClosesAt.toString())}
                        </p>
                        <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-m font-semibold ${
                          game.status === 'live'
                            ? 'bg-yellow-500/15 text-yellow-400 animate-pulse'
                            : 'bg-zinc-700/40 text-zinc-400'
                        }`}>
                          {game.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {resolvingId === game._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={resolveWinner}
                              onChange={e => setResolveWinner(e.target.value as any)}
                              className="rounded-xl border border-zinc-700 bg-[#181b22] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                            >
                              <option value="">Pick winner…</option>
                              <option value="home">{game.homeTeam} wins</option>
                              <option value="away">{game.awayTeam} wins</option>
                              <option value="tie">Tie</option>
                            </select>
                            <button
                              disabled={!resolveWinner}
                              onClick={() => handleResolveGame(game._id)}
                              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-500 transition disabled:opacity-40"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setResolvingId(null); setResolveWinner('') }}
                              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-400 hover:border-white transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setResolvingId(game._id); setResolveWinner(''); setResolveError(null); setResolveSuccess(null) }}
                            className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/20 transition"
                          >
                            Set Result
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminPage
