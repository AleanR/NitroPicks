import { useEffect, useState } from 'react'

interface Bet {
  id: string
  gameId: string
  matchup: string
  marketType: string
  team: 'home' | 'away'
  selection: string
  odds: number
}

interface StakeHandlerProps {
  activeBets: Bet[]
  onBetPlaced?: () => void
}

function StakeHandler({ activeBets, onBetPlaced }: StakeHandlerProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stake, setStake] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

    useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me', {
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

    const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setStake(value)
    }
  }

  const totalDecimalOdds = activeBets.reduce((total, bet) => {
    const numericOdds = Number(bet.odds)
    if (isNaN(numericOdds)) return total
    return total * numericOdds
  }, 1)

  const stakeAmount = Number(stake)
  const payout =
    stake !== '' && !isNaN(stakeAmount) ? Math.round(stakeAmount * totalDecimalOdds) : ''

  const handlePlaceBet = async () => {
    setMessage(null)
    setError(null)

    if (!user) {
      setError('Please sign in to place a bet.')
      return
    }

    if (activeBets.length === 0) {
      setError('Please add at least one selection to your bet slip.')
      return
    }

    if (!Number.isFinite(stakeAmount) || stakeAmount < 1) {
      setError('Enter a valid stake of at least 1 KP.')
      return
    }

    try {
      setSubmitting(true)

      const legs = activeBets.map((bet) => ({
        gameId: bet.gameId,
        team: bet.team,
        odds: Number(bet.odds),
      }))

      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stake: stakeAmount,
          legs,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.message ?? 'Unable to place bet right now.')
        return
      }

      const meRes = await fetch('/api/users/me', {
        credentials: 'include',
      })

      if (meRes.ok) {
        const refreshedUser = await meRes.json()
        setUser(refreshedUser)
        window.dispatchEvent(
          new CustomEvent('kp-updated', {
            detail: { knightPoints: refreshedUser?.knightPoints ?? null },
          }),
        )
      }

      setMessage('Bet placed successfully.')
      setStake('')
      onBetPlaced?.()
    } catch {
      setError('Unable to place bet right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3">
      <div className="flex justify-center">
        <span className="text-2xl font-bold text-yellow-400">
          {totalDecimalOdds.toFixed(2)}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={stake}
          onChange={handleStakeChange}
          placeholder="Stake"
          className="h-10 w-1/2 rounded-lg border border-zinc-700 bg-[#181b22] px-3 text-sm text-white outline-none placeholder:text-zinc-500 transition focus:border-yellow-400"
        />

        <div className="flex h-10 w-1/2 items-center justify-center rounded-lg border border-zinc-700 bg-[#181b22] px-3 text-sm text-zinc-400">
          {payout ? `${payout} KP` : 'Payout'}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-zinc-400">Checking auth...</div>
      ) : user ? (
        <button
          type="button"
          onClick={handlePlaceBet}
          disabled={submitting || activeBets.length === 0}
          className="w-full rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-yellow-400/70"
        >
          {submitting ? 'Placing...' : 'Place Bet'}
        </button>
      ) : (
        <p className="text-center text-sm text-zinc-300">
          Please <a href="/login" className="text-yellow-400 underline">sign in</a> or <a href="/register" className="text-yellow-400 underline">sign up</a> to place a bet.
        </p>
      )}

      {message && <p className="text-center text-sm text-green-400">{message}</p>}
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  )
}

export default StakeHandler
