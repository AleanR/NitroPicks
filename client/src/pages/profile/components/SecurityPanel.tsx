import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
  isVerified: boolean
}

export default function SecurityPanel({ isVerified }: Props) {
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const handleResend = async () => {
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/users/auth/resend-verification', {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        setSent(true)
      } else {
        const body = await res.json()
        setSendError(body.message ?? 'Failed to send email.')
      }
    } catch {
      setSendError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <h2 className="text-2xl font-extrabold text-white">Security</h2>
      <p className="mt-1 text-sm text-zinc-500">Manage your account security settings</p>

      <div className="mt-5 space-y-3">
        {/* Password reset */}
        <div className="rounded-2xl bg-black px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white">Password</p>
              <p className="mt-0.5 text-sm text-zinc-400">
                Send a reset link to your UCF email
              </p>
            </div>
            <button
              onClick={() => navigate('/forgot-password')}
              className="shrink-0 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* Email verification */}
        <div className="rounded-2xl bg-black px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white">Email Verification</p>
              {isVerified ? (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Account already verified
                </p>
              ) : sent ? (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-yellow-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                  Check your inbox
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-zinc-400">
                  {sendError ?? 'Verify your UCF student email address'}
                </p>
              )}
            </div>

            {isVerified ? (
              <button
                disabled
                className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-600 cursor-not-allowed"
              >
                Verified
              </button>
            ) : (
              <button
                onClick={handleResend}
                disabled={sending || sent}
                className="shrink-0 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Sending…' : sent ? 'Sent' : 'Send Verification'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
