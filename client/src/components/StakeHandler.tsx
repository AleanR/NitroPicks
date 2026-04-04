import { useEffect, useState } from 'react'

interface Bet {
  id: string
  eventId: string
  matchup: string
  marketType: string
  selection: string
  odds: string
}

interface StakeHandlerProps {
  activeBets: Bet[]
}

function StakeHandler({ activeBets }: StakeHandlerProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stake, setStake] = useState('')

    useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
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
        <button className="w-full rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95">
          Place Bet
        </button>
      ) : (
        <p className="text-center text-sm text-zinc-300">
          Please <a href="/login" className="text-yellow-400 underline">sign in</a> or <a href="/register" className="text-yellow-400 underline">sign up</a> to place a bet.
        </p>
      )}
    </div>
  )
}

export default StakeHandler