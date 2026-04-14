import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { formatDate, formatEditDate, formatTime } from '../helper/dateTimeFormat'
import GameTimer from '../components/Timer'
import { gameStarted } from '../helper/dateTimeFormat'

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
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  

  // Score update controller
  const [score, setScore] = useState<number>(0);
  const [teamScore, setTeamScore] = useState<string>("");

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

  
  const fetchGames = async () => {
    try {
      const res = await fetch('/api/games/all', { credentials: 'include' })
      if (res.ok) setGames(await res.json())
    } catch {
      setError('Failed to load games')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchGames() }, [])


  const handleChange = (field: keyof Form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    console.log(form)
  }

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
      await fetchGames()

    } catch {
      setError('Failed to save game')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (game: Game) => {
    setEditingId(game._id)
    setForm({
      sport: game.sport,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      date: formatEditDate(game.bettingClosesAt),
      time: formatTime(game.bettingClosesAt),
      emoji: `${game.sport} ${game.emoji}`,
      homeOdds: String(game.homeWin.odds) ?? '1.90',
      awayOdds: String(game.awayWin.odds) ?? '1.90',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this game?')) return
    try {
      await fetch(`api/games/${id}/cancel`, {
        method: "DELETE",
        credentials: 'include',
      })
    } catch {
      setError('Failed to cancel game')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this game?')) return
    try {
      await fetch(`/api/games/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      await fetchGames()
    } catch {
      setError('Failed to delete game')
    }
  }

  const endGame = async (gameId: string) => {
    try {
      await fetch(`api/games/${gameId}/end`, {
        method: 'PUT',
        credentials: 'include',
      })

      await fetchGames()
    } catch (error) {
      console.log("Failed to end game", error)
    }
  }

  const submitScoreUpdate = async (gameId: string, team: string, score: number) => {
    
    setGames(prev => 
      prev.map(game =>
        game._id === gameId
        ? {
          ...game,
          scoreHome: team === "home"
          ? game.scoreHome + score
          : game.scoreHome,
          scoreAway: team === "away"
          ? game.scoreAway + score
          : game.scoreAway
        }
        : game
      )
    );

    try {
      await fetch(`/api/games/${gameId}/score`, {
        method: "PATCH",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team: team,
          score: score
        }),
      });
      setScore(0);
      setTeamScore("");
    } catch (error) {
      console.log("Failed to update score", error);
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
            <p className="text-zinc-400">Manage games and markets</p>
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
            {editingId ? 'Edit game' : 'Create New game'}
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
                {saving ? 'Saving...' : editingId ? 'Update game' : 'Create game'}
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

        {/* game LIST */}
        <section>
          <h2 className="mb-5 text-2xl font-extrabold">All Games</h2>

          {loading ? (
            <p className="text-zinc-400">Loading games...</p>
          ) : games.length === 0 ? (
            <p className="text-zinc-400">No games yet. Create one above.</p>
          ) : (
            <div className="space-y-4">
              {games.map(game => (
                <div key={game._id} className="rounded-3xl border border-zinc-800 bg-[#14161d] px-6 py-5">
                  <div className="flex flex-wrap justify-between gap-4">

                    {/* HOME TEAM SCORE CONTROLLER */}
                    <div className='p-5 ml-6 flex flex-col gap-3 items-center justify-center'>
                      <p className="text-xl font-bold text-wrap">
                        {game.emoji} {game.homeTeam}
                      </p>
                      <h2 className='w-50 h-30 rounded-xl border border-zinc-700 bg-[#181b22] text-8xl flex items-center justify-center text-white'>
                        {game.scoreHome}
                      </h2>
                      {
                        gameStarted(game.bettingClosesAt) && game.status !== "cancelled" && game.status !== "finished"
                        ?
                        <div className='flex flex-col gap-3 items-center'>
                          <div className='flex gap-5'>
                            <button
                              onClick={() => {
                                setScore(score + 1)
                                setTeamScore("home")
                              }}
                              className="w-15 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-xl font-semibold text-white hover:border-yellow-400 transition"
                            >
                              +
                              {score > 0 && teamScore === "home" ? Math.abs(score) : ""}
                            </button>
                            <button
                              onClick={() => {
                                setScore(score - 1)
                                setTeamScore("home")
                              }}
                              className="w-15 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-xl font-semibold text-white hover:border-yellow-400 transition"
                              >
                              -
                              {score < 0 && teamScore === "home" ? Math.abs(score) : ""}
                            </button>
                          </div>
                          <button
                              onClick={() => submitScoreUpdate(game._id, teamScore, score)}
                              className="w-30 rounded-xl border border-zinc-700 bg-green-500 px-4 py-2 text-xl font-semibold text-white hover:border-green-400 transition"
                            >
                              ✓
                          </button>
                        </div>
                        : ""
                      }
                    </div>
                    {/* HOME TEAM SCORE CONTROLLER */}

                    <div className="flex flex-col items-center gap-3 p-5">
                      <p className="mt-1 text-zinc-400">{formatDate(game.bettingClosesAt)} • {formatTime(game.bettingClosesAt)}</p>
                      <p className='font-medium text-m'>ODDS</p>
                      <p className="text-xl text-zinc-400">
                        {game.homeWin.odds || '—'} &nbsp;|&nbsp; {game.awayWin.odds || '—'}
                      </p>
                      <button
                        className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                            game.status === 'live'
                            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 animate-pulse'
                            : game.status === 'finished'
                            ? 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            : 'border-zinc-600 bg-zinc-700/20 text-zinc-400 hover:bg-zinc-700/40'
                        }`}
                      >
                        {game.status === 'live' && gameStarted(game.bettingClosesAt)
                        ? <GameTimer startTime={game.bettingClosesAt}></GameTimer>
                        : game.status.toUpperCase()
                        }
                      </button>
                      <button
                        onClick={() => handleEdit(game)}
                        className="rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white hover:border-yellow-400 transition"
                      >
                        EDIT
                      </button>
                      <div className='flex gap-3'>
                        <button
                          onClick={() => handleCancel(game._id)}
                          className="rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white hover:border-red-500 transition"
                        >
                          CANCEL
                        </button>

                        <button
                          onClick={() => handleDelete(game._id)}
                          className="rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-red-400 hover:border-red-500 transition"
                        >
                          DELETE
                        </button>
                      </div>
                      {gameStarted(game.bettingClosesAt) && game.status === "live"
                      ? 
                      <button
                          onClick={() => endGame(game._id)}
                          className="rounded-xl border border-zinc-700 bg-green-500 px-6 py-3 text-l font-semibold text-white hover:border-green-500 transition"
                      >
                        END
                      </button>
                      : ""}
                      
                    </div>

                    {/* AWAY TEAM SCORE CONTROLLER */}
                    <div className='p-5 mr-6 flex flex-col gap-3 items-center justify-center'>
                      <p className="text-xl font-bold text-wrap">
                        {game.emoji} {game.awayTeam}
                      </p>
                      <h2 className='w-50 h-30 rounded-xl border border-zinc-700 bg-[#181b22] text-8xl flex items-center justify-center text-white'>
                        {game.scoreAway}
                      </h2>
                      {
                        gameStarted(game.bettingClosesAt) && game.status !== "cancelled" && game.status !== "finished"
                        ?
                        <div className='flex flex-col gap-3 items-center'>
                          <div className='flex gap-5'>
                            <button
                              onClick={() => {
                                setScore(score + 1)
                                setTeamScore("away")
                              }}
                              className="w-15 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-xl font-semibold text-white hover:border-yellow-400 transition"
                            >
                              +
                              {score > 0 && teamScore === "away" ? Math.abs(score) : ""}
                            </button>
                            <button
                              onClick={() => {
                                setScore(score - 1)
                                setTeamScore("away")
                              }}
                              className="w-15 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-xl font-semibold text-white hover:border-yellow-400 transition"
                              >
                              -
                              {score < 0 && teamScore === "away" ? Math.abs(score) : ""}
                            </button>
                          </div>
                          <button
                              onClick={() => submitScoreUpdate(game._id, teamScore, score)}
                              className="w-30 rounded-xl border border-zinc-700 bg-green-500 px-4 py-2 text-xl font-semibold text-white hover:border-green-400 transition"
                            >
                              ✓
                          </button>
                        </div>
                        : ""
                      }
                    </div>
                    {/* AWAY TEAM SCORE CONTROLLER */}

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
