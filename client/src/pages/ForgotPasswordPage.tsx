import { useState } from 'react'
import { Link } from 'react-router-dom'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resetURL, setResetURL] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailError('')
    setServerError('')

    if (!email.trim()) {
      setEmailError('Email is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || 'Something went wrong.')
      setResetURL(data.resetURL ?? null)
      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" className="w-8 h-8">
                <path d="M13 2L3 14h7v8l10-12h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold">NitroPicks</h1>
          </div>
          <p className="text-zinc-400 text-center text-sm">Reset your password</p>
        </div>

        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {submitted ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-yellow-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Reset link ready</h2>
              <p className="text-sm text-zinc-400">Click the link below to reset your password. It expires in 15 minutes.</p>
              {resetURL && (
                <a
                  href={resetURL}
                  className="mt-1 w-full rounded-xl bg-yellow-400 py-3 text-center font-bold text-black hover:bg-yellow-300 transition block"
                >
                  Reset My Password
                </a>
              )}
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition">
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Forgot Password</h2>
                <p className="text-sm text-zinc-400">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {serverError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-red-400">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-400">{serverError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                  className={`w-full rounded-xl border px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-400 ${
                    emailError ? 'border-red-500/60 bg-red-500/5' : 'border-zinc-700 bg-zinc-900'
                  }`}
                />
                {emailError && <p className="mt-1.5 text-xs text-red-400">{emailError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-yellow-400 text-black font-bold py-3 hover:bg-yellow-300 transition disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending…
                  </span>
                ) : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
