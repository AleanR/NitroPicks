import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'

interface Perk {
  rewardId: string
  name: string
  description: string
  cost: number
  icon: string
}

interface ConfirmModal {
  perk: Perk
}

interface SuccessModal {
  perkName: string
  code: string
  newBalance: number
}

export default function RedeemPointsPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [perks, setPerks] = useState<Perk[]>([])
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null)
  const [successModal, setSuccessModal] = useState<SuccessModal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setBalance(data.knightPoints ?? 0)
        setUserId(data._id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/rewards', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setPerks(data.map((r) => ({
            rewardId: r._id,
            name: r.name,
            description: r.description,
            cost: r.cost,
            icon: r.icon ?? '🎁',
          })))
        }
      })
      .catch(() => {})
  }, [])

  const handleRedeem = async () => {
    if (!confirmModal || !userId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/users/${userId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rewardId: confirmModal.perk.rewardId }),
      })
      const data = await res.json()
      if (res.ok) {
        setBalance(data.knightPoints)
        setConfirmModal(null)
        setSuccessModal({
          perkName: confirmModal.perk.name,
          code: data.confirmationCode,
          newBalance: data.knightPoints,
        })
        window.dispatchEvent(new CustomEvent('kp-updated'))
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch {
      setError('Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  const canAfford = (cost: number) => balance !== null && balance >= cost

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 pt-6 pb-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/10 text-4xl">
            🏪
          </div>
          <h1 className="text-3xl font-bold text-white">KP Store</h1>
          <p className="mt-2 text-zinc-400">Spend your Knights Points on exclusive UCF campus perks.</p>
          {balance !== null ? (
            <p className="mt-3 text-sm font-semibold text-yellow-400">
              Your balance: {balance.toLocaleString()} KP
            </p>
          ) : (
            <div className="mx-auto mt-3 h-5 w-40 animate-pulse rounded-lg bg-zinc-800" />
          )}
        </div>

        {/* Perk Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {perks.map((perk) => {
            const affordable = canAfford(perk.cost)
            return (
              <div
                key={perk.rewardId}
                className={`rounded-2xl border bg-[#14161d] p-5 transition ${
                  affordable
                    ? 'border-zinc-700 hover:border-yellow-400/40'
                    : 'border-zinc-800 opacity-60'
                }`}
              >
                <div className="mb-3 text-3xl">{perk.icon}</div>
                <h2 className="font-semibold text-white">{perk.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{perk.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-yellow-400">
                    {perk.cost.toLocaleString()} KP
                  </span>
                  <button
                    onClick={() => { setError(''); setConfirmModal({ perk }) }}
                    disabled={!affordable}
                    className="rounded-lg bg-yellow-400 px-4 py-1.5 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                  >
                    {affordable ? 'Redeem' : 'Not enough KP'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ---- Confirm Modal ---- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#14161d] p-6 shadow-2xl">
            <div className="mb-4 text-center text-4xl">{confirmModal.perk.icon}</div>
            <h2 className="mb-1 text-center text-lg font-bold text-white">
              Confirm Purchase
            </h2>
            <p className="mb-4 text-center text-sm text-zinc-400">
              {confirmModal.perk.name} for{' '}
              <span className="font-bold text-yellow-400">
                {confirmModal.perk.cost.toLocaleString()} KP
              </span>
            </p>

            {error && (
              <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmModal(null); setError('') }}
                disabled={loading}
                className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={loading}
                className="flex-1 rounded-xl bg-yellow-400 py-2.5 text-sm font-bold text-black hover:bg-yellow-300 transition disabled:opacity-50"
              >
                {loading ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Success Modal ---- */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#14161d] p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-3xl">
              ✅
            </div>
            <h2 className="mb-1 text-lg font-bold text-white">Purchase Complete!</h2>
            <p className="mb-5 text-sm text-zinc-400">
              Your <span className="text-white font-medium">{successModal.perkName}</span> has been redeemed. Show this code on campus:
            </p>

            <div className="mb-5 rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-4 py-4">
              <p className="mb-1 text-xs text-zinc-500 uppercase tracking-widest">Confirmation Code</p>
              <p className="font-mono text-2xl font-bold tracking-[0.25em] text-yellow-400 select-all">
                {successModal.code}
              </p>
            </div>

            <p className="mb-5 text-sm text-zinc-400">
              New balance:{' '}
              <span className="font-bold text-yellow-400">
                {successModal.newBalance.toLocaleString()} KP
              </span>
            </p>

            <button
              onClick={() => setSuccessModal(null)}
              className="w-full rounded-xl bg-yellow-400 py-2.5 font-bold text-black hover:bg-yellow-300 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
