import { useEffect, useState } from 'react'

type Redemption = {
  _id: string
  rewardName: string
  voucherCode: string
  pointsCost: number
  redeemedAt: string
}

type Props = {
  userId: string
}

export default function VoucherHistoryPanel({ userId }: Props) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/redemptions`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load vouchers')
        const data = await res.json()
        setRedemptions(data)
      } catch {
        setError('Could not load voucher history.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-800/50" />
        ))}
      </div>
    </section>
  )

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Voucher History</h2>
          <p className="mt-1 text-sm text-zinc-500">Your previously redeemed rewards</p>
        </div>
        <span className="rounded-xl border border-zinc-700 bg-[#0d0d0f] px-3 py-1 text-sm font-bold text-zinc-400">
          {redemptions.length} total
        </span>
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-400">{error}</p>
      )}

      {!error && redemptions.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-3 pb-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-2xl">
            🎟️
          </div>
          <p className="font-semibold text-zinc-400">No vouchers yet</p>
          <p className="text-sm text-zinc-600">Redeem rewards from the KP Store to see them here.</p>
        </div>
      )}

      {!error && redemptions.length > 0 && (
        <div className="mt-5 space-y-3">
          {redemptions.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{r.rewardName}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {new Date(r.redeemedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' · '}
                    <span className="text-yellow-500">{r.pointsCost.toLocaleString()} KP</span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-lg border border-yellow-400/30 bg-yellow-400/5 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-yellow-400">
                    {r.voucherCode}
                  </span>
                  <button
                    onClick={() => handleCopy(r.voucherCode)}
                    title="Copy code"
                    className="rounded-lg border border-zinc-700 bg-[#181b22] p-1.5 text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
                  >
                    {copied === r.voucherCode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-400">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
