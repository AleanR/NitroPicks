import { createContext, useContext, useEffect, useState } from 'react'

type AuthUser = {
  _id: string
  firstname: string
  lastname: string
  email: string
  isAdmin: boolean
}

type AuthState = {
  user: AuthUser | null
  loading: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, refetch: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const r = await fetch('/api/users/me', { credentials: 'include' })
      setUser(r.ok ? await r.json() : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUser() }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
