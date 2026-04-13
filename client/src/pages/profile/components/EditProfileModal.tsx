import { useState, useEffect } from 'react'

type User = {
  _id: string
  firstname: string
  lastname: string
  username: string
  email: string
  major: string
  ucfID: string
  knightPoints: number
  createdAt: string
  isVerified: boolean
}

type Props = {
  user: User
  onClose: () => void
  onSaved: (updated: User) => void
}

export default function EditProfileModal({ user, onClose, onSaved }: Props) {
  const [username, setUsername] = useState(user.username)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty.')
      return
    }
    if (username === user.username) {
      onClose()
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })

      const body = await res.json()

      if (res.ok) {
        onSaved({ ...user, username: username.trim() })
        onClose()
      } else {
        setError(body.message ?? 'Failed to update profile.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#14161d] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Edit Profile</h2>
            <p className="mt-1 text-sm text-zinc-400">Update your public username</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 p-2 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {/* Read-only full name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Full Name
            </label>
            <input
              value={`${user.firstname} ${user.lastname}`}
              readOnly
              className="w-full rounded-xl border border-zinc-800 bg-[#0d0d0f] px-4 py-3 text-sm text-zinc-500 outline-none"
            />
          </div>

          {/* Editable username */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}
              placeholder="Enter username"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400 ${
                error ? 'border-red-500/60 bg-red-500/5' : 'border-zinc-700 bg-[#181b22]'
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs font-semibold text-red-400">{error}</p>
            )}
          </div>

          {/* Read-only email */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              UCF Email
            </label>
            <input
              value={user.email}
              readOnly
              className="w-full rounded-xl border border-zinc-800 bg-[#0d0d0f] px-4 py-3 text-sm text-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-700 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-yellow-400 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
