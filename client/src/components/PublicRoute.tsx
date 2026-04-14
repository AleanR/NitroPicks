import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <svg className="h-8 w-8 animate-spin text-yellow-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  )

  if (user) return <Navigate to="/" replace />

  return <>{children}</>
}
