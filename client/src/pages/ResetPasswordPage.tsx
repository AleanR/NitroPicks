import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

type PageState = 'form' | 'success' | 'expired'

function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [loading, setLoading] = useState(false)
  const [pageState, setPageState] = useState<PageState>(!token ? 'expired' : 'form')

  const validate = () => {
    const e: { password?: string; confirm?: string } = {}
    if (!password) e.password = 'Password is required.'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!confirm) e.confirm = 'Please confirm your password.'
    else if (password !== confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users/reset-password/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => null)

      if (res.status === 401) {
        setPageState('expired')
        return
      }

      if (!res.ok) throw new Error(data?.message || 'Reset failed.')

      setPageState('success')
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      setPageState('expired')
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

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
          <p className="text-zinc-400 text-center text-sm">Set a new password</p>
        </div>

        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 shadow-2xl">

          {pageState === 'success' && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-green-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Password updated!</h2>
              <p className="text-sm text-zinc-400">Redirecting you to sign in…</p>
              <Link to="/login" className="mt-2 text-sm text-yellow-400 font-semibold hover:underline">
                Go to Sign In
              </Link>
            </div>
          )}

          {pageState === 'expired' && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-red-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Link expired or invalid</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                This reset link has expired or is no longer valid. Reset links are only valid for 15 minutes.
              </p>
              <Link
                to="/forgot-password"
                className="mt-2 w-full rounded-xl bg-yellow-400 py-3 text-center font-bold text-black hover:bg-yellow-300 transition block"
              >
                Request a New Link
              </Link>
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition">
                Back to Sign In
              </Link>
            </div>
          )}

          {pageState === 'form' && (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">New Password</h2>
                <p className="text-sm text-zinc-400">Choose a new password for your account.</p>
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
                    className={`w-full rounded-xl border px-4 py-3 pr-11 text-white outline-none transition focus:border-yellow-400 ${
                      errors.password ? 'border-red-500/60 bg-red-500/5' : 'border-zinc-700 bg-zinc-900'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })) }}
                    className={`w-full rounded-xl border px-4 py-3 pr-11 text-white outline-none transition focus:border-yellow-400 ${
                      errors.confirm ? 'border-red-500/60 bg-red-500/5' : 'border-zinc-700 bg-zinc-900'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition">
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {errors.confirm && <p className="mt-1.5 text-xs text-red-400">{errors.confirm}</p>}
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
                    Updating…
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
