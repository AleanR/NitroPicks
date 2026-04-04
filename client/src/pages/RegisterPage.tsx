import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    ucfID: '',
    major: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || `Registration failed (${response.status})`)
      }

      navigate('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="black"
                viewBox="0 0 24 24"
                className="w-8 h-8"
              >
                <path d="M13 2L3 14h7v8l10-12h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold">NitroPicks</h1>
          </div>
          <p className="text-gray-400 text-center">
            Make predictions, win points, compete with Knights
          </p>
        </div>

        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-2">First Name</label>
              <input
                name="firstname"
                type="text"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Last Name</label>
              <input
                name="lastname"
                type="text"
                value={formData.lastname}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Username</label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">UCF ID</label>
              <input
                name="ucfID"
                type="text"
                value={formData.ucfID}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Major</label>
              <input
                name="major"
                type="text"
                value={formData.major}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">UCF Email</label>
              <input
                name="email"
                type="email"
                placeholder="knights@ucf.edu"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-yellow-400 text-black font-semibold py-3 hover:brightness-95 transition disabled:opacity-60"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-yellow-400 font-semibold hover:underline">
              Already have an account? Sign in
            </Link>
          </div>

          <div className="mt-8 border-t border-zinc-800 pt-6">
            <p className="text-center text-sm text-gray-500 leading-6">
              Simulated betting for UCF games only. Use virtual points, compete
              with friends, climb leaderboards, and redeem rewards for campus
              perks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage