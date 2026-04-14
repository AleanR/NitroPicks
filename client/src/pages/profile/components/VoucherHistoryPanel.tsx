import { useEffect, useState } from 'react'

type Redemption = {
  _id: string
  rewardName: string
  voucherCode: string
  pointsCost: number
  redeemedAt: string
}

type TicketRedemption = {
  _id: string
  pointsAdded: number
  redeemedAt: string
}

type HistoryEntry =
  | { kind: 'voucher'; data: Redemption }
  | { kind: 'ticket'; data: TicketRedemption }

type Props = {
  userId: string
}

type VoucherTab = 'redeem' | 'history'

export default function VoucherHistoryPanel({ userId }: Props) {
  const [activeTab, setActiveTab] = useState<VoucherTab>('redeem')

  // ── Redeem tab state ──────────────────────────────────────────────────────
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null)
  const [redeemError, setRedeemError] = useState<string | null>(null)

  // ── History tab state ─────────────────────────────────────────────────────
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const [voucherRes, ticketRes] = await Promise.all([
        fetch(`/api/users/${userId}/redemptions`, { credentials: 'include' }),
        fetch(`/api/users/${userId}/ticket-redemptions`, { credentials: 'include' }),
      ])
      const vouchers: Redemption[] = voucherRes.ok ? await voucherRes.json() : []
      const tickets: TicketRedemption[] = ticketRes.ok ? await ticketRes.json() : []

      const combined: HistoryEntry[] = [
        ...vouchers.map((d): HistoryEntry => ({ kind: 'voucher', data: d })),
        ...tickets.map((d): HistoryEntry => ({ kind: 'ticket', data: d })),
      ].sort((a, b) => new Date(b.data.redeemedAt).getTime() - new Date(a.data.redeemedAt).getTime())

      setHistory(combined)
    } catch {
      setHistoryError('Could not load history.')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => { loadHistory() }, [userId])

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCode(val)
    setRedeemError(null)
    setRedeemSuccess(null)
  }

  const handleRedeem = async () => {
    if (code.length !== 16) {
      setRedeemError('Enter the full 16-digit confirmation number.')
      return
    }
    setSubmitting(true)
    setRedeemError(null)
    setRedeemSuccess(null)
    try {
      const res = await fetch('/api/users/earn-points', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRedeemError(data.message ?? 'Could not redeem this code.')
      } else {
        setRedeemSuccess(data.message ?? '1000 KP added!')
        setCode('')
        loadHistory()
      }
    } catch {
      setRedeemError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = (voucherCode: string) => {
    navigator.clipboard.writeText(voucherCode)
    setCopied(voucherCode)
    setTimeout(() => setCopied(null), 2000)
  }

  const tabClass = (tab: VoucherTab) =>
    `flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
      activeTab === tab
        ? 'bg-yellow-400 text-black'
        : 'text-zinc-400 hover:text-white'
    }`

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Vouchers</h2>
          <p className="mt-1 text-sm text-zinc-500">Redeem ticket codes or view reward history</p>
        </div>
        {activeTab === 'history' && (
          <span className="rounded-xl border border-zinc-700 bg-[#0d0d0f] px-3 py-1 text-sm font-bold text-zinc-400">
            {history.length} total
          </span>
        )}
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-zinc-800 bg-black p-1">
        <button className={tabClass('redeem')} onClick={() => setActiveTab('redeem')}>
          Redeem Code
        </button>
        <button className={tabClass('history')} onClick={() => setActiveTab('history')}>
          History
        </button>
      </div>

      {/* ── REDEEM TAB ── */}
      {activeTab === 'redeem' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-xl">
                🎟️
              </div>
              <div>
                <p className="font-bold text-white">UCF Ticket Code</p>
                <p className="text-xs text-zinc-500">Enter the 16-digit confirmation number from your UCF game ticket</p>
              </div>
            </div>

            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Confirmation Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234567890123456"
              value={code}
              onChange={handleCodeChange}
              maxLength={16}
              className={`w-full rounded-xl border bg-[#0d0d0f] px-4 py-3 font-mono text-lg font-bold tracking-widest text-white outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-600 focus:border-yellow-400 ${
                redeemError ? 'border-red-500' : 'border-zinc-700'
              }`}
            />

            {/* Character counter */}
            <div className="mt-1.5 flex items-center justify-between">
              <span className={`text-xs ${redeemError ? 'text-red-400' : 'text-zinc-600'}`}>
                {redeemError ?? `${code.length} / 16 digits`}
              </span>
              {code.length === 16 && !redeemError && (
                <span className="text-xs font-semibold text-green-400">Ready to redeem</span>
              )}
            </div>
          </div>

          {/* Success banner */}
          {redeemSuccess && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-green-400">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-green-400">{redeemSuccess}</p>
                <p className="text-xs text-green-500/80">Your Knight Points balance has been updated.</p>
              </div>
            </div>
          )}

          <button
            onClick={handleRedeem}
            disabled={submitting || code.length !== 16}
            className="w-full rounded-xl bg-yellow-400 py-3 font-bold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Redeeming…' : 'Redeem Code'}
          </button>

          <p className="text-center text-xs text-zinc-600">
            Each ticket code can only be used once · 1,000 KP per redemption
          </p>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <>
          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-800/50" />
              ))}
            </div>
          ) : historyError ? (
            <p className="text-center text-sm text-red-400">{historyError}</p>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-2xl">
                🎟️
              </div>
              <p className="font-semibold text-zinc-400">No history yet</p>
              <p className="text-sm text-zinc-600">Redeem a ticket code or a KP Store reward to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => {
                if (entry.kind === 'ticket') {
                  const t = entry.data
                  return (
                    <div key={t._id} className="rounded-2xl border border-zinc-800 bg-black px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-base">🎟️</div>
                          <div className="min-w-0">
                            <p className="font-bold text-white">Ticket Code Redeemed</p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {new Date(t.redeemedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm font-bold text-green-400">
                          +{t.pointsAdded.toLocaleString()} KP
                        </span>
                      </div>
                    </div>
                  )
                }

                const r = entry.data as Redemption
                return (
                  <div key={r._id} className="rounded-2xl border border-zinc-800 bg-black px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-base">🏆</div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">{r.rewardName}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {new Date(r.redeemedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' · '}
                            <span className="text-yellow-500">-{r.pointsCost.toLocaleString()} KP</span>
                          </p>
                        </div>
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
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}
