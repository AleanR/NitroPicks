import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pointsOpen, setPointsOpen] = useState(false)
  const pointsRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pointsRef.current && !pointsRef.current.contains(e.target as Node)) {
        setPointsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.warn('Logout failed', err)
    } finally {
      setUser(null)
      navigate('/')
    }
  }

  const navClass = (path: string) =>
    `font-medium transition ${
      isActive(path)
        ? 'text-yellow-400'
        : 'text-white hover:text-yellow-400'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#111216]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* LEFT SIDE */}
        <div className="flex items-center gap-10">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="black"
                viewBox="0 0 24 24"
                className="h-5 w-5"
              >
                <path d="M13 2L3 14h7v8l10-12h-7z" />
              </svg>
            </div>

            <span className="text-3xl font-extrabold tracking-tight text-white">
              NitroPicks
            </span>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className={navClass('/')}>
              Home
            </Link>

            <Link to="/markets" className={navClass('/markets')}>
              Markets
            </Link>

            <Link to="/leaderboard" className={navClass('/leaderboard')}>
              Leaderboard
            </Link>

            {/* POINTS DROPDOWN — only for logged-in non-admin users */}
            {user && !user.isAdmin && (
              <div ref={pointsRef} className="relative">
                <button
                  onClick={() => setPointsOpen((o) => !o)}
                  className={`flex items-center gap-1 font-medium transition ${
                    location.pathname === '/earn-points' || location.pathname === '/redeem-points'
                      ? 'text-yellow-400'
                      : 'text-white hover:text-yellow-400'
                  }`}
                >
                  Points
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>

                {pointsOpen && (
                  <div className="absolute left-0 top-full mt-2 w-44 rounded-xl border border-zinc-700 bg-[#14161d] py-1 shadow-xl">
                    <Link
                      to="/earn-points"
                      onClick={() => setPointsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 hover:text-yellow-400 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4 text-yellow-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Earn Points
                    </Link>
                    <Link
                      to="/redeem-points"
                      onClick={() => setPointsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 hover:text-yellow-400 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4 text-yellow-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125a2.625 2.625 0 000-5.25zM12 10.125V21" />
                      </svg>
                      Redeem Points
                    </Link>
                  </div>
                )}
              </div>
            )}

            {user?.isAdmin && (
              <Link to="/admin" className={navClass('/admin')}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">
          {loading ? (
            <span className="text-zinc-400">...</span>
          ) : user ? (
            <>
              {/* KP DISPLAY */}
              <button className="flex items-center gap-2 rounded-xl border border-yellow-500/40 bg-[#0d0d0f] px-5 py-3 font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-yellow-400"
                >
                  <path d="M13 2L3 14h7v8l10-12h-7z" />
                </svg>

                <span className="min-w-[5ch] text-xl font-bold tabular-nums text-white">
                  {user?.pointBalance ?? 0}
                </span>

                <span className="text-sm text-zinc-300">KP</span>
              </button>

              {/* PROFILE ICON */}
              <Link
                to="/profile"
                className="text-white hover:text-yellow-400 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
                  />
                </svg>
              </Link>

              {/* SIGN OUT */}
              <button
                onClick={handleLogout}
                className="rounded-xl border border-zinc-700 bg-[#111216] px-4 py-2 font-semibold text-white hover:border-red-400 hover:text-red-400 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-zinc-700 bg-[#111216] px-4 py-2 font-semibold text-white hover:border-yellow-400"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-yellow-400 px-4 py-2 font-semibold text-black"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navigation