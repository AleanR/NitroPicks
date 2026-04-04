import { useState } from 'react'
import Navigation from '../components/Navigation'

export default function EarnPointsPage() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [newBalance, setNewBalance] = useState<number | null>(null)

  const isValidCode = /^\d{16}$/.test(code)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidCode) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('http://localhost:8080/earn-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
        setNewBalance(data.pointBalance)
        setCode('')
      } else {
        setStatus('error')
        setMessage(data.message || 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Could not connect to server.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <Navigation />

      <div className="flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/10 text-4xl">
              🎟️
            </div>
            <h1 className="text-3xl font-bold text-white">Earn Points</h1>
            <p className="mt-2 text-zinc-400">Enter your 16-digit code to receive 1,000 KP</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#14161d] p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Redemption Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setCode(val)
                    setStatus('idle')
                    setMessage('')
                  }}
                  placeholder="0000000000000000"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center font-mono text-xl tracking-[0.3em] text-white placeholder-zinc-600 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
                <p className="mt-1.5 text-right text-xs text-zinc-500">
                  {code.length} / 16 digits
                </p>
              </div>

              <button
                type="submit"
                disabled={!isValidCode || status === 'loading'}
                className="w-full rounded-xl bg-yellow-400 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === 'loading' ? 'Redeeming…' : 'Redeem Code'}
              </button>
            </form>

            {/* Feedback */}
            {status === 'success' && (
              <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                <p className="font-semibold text-green-400">{message}</p>
                {newBalance !== null && (
                  <p className="mt-1 text-sm text-zinc-300">
                    New balance: <span className="font-bold text-yellow-400">{newBalance.toLocaleString()} KP</span>
                  </p>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
                <p className="font-semibold text-red-400">{message}</p>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            Codes are single-use and provided by NitroPicks promotions.
          </p>
        </div>
      </div>
    </div>
  )
}
