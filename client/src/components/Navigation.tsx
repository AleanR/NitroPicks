import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

type NotificationBetLeg = {
  team: 'home' | 'away'
  gameId?: string | { homeTeam?: string; awayTeam?: string }
}

type NotificationBet = {
  _id: string
  status: 'active' | 'win' | 'lose' | 'refunded'
  stake: number
  expectedPayout: number
  createdAt: string
  legs: NotificationBetLeg[]
}

type BetNotification = {
  id: string
  title: string
  createdAt: string
  result: 'win' | 'lose'
}

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pointsOpen, setPointsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [allBetNotifications, setAllBetNotifications] = useState<BetNotification[]>([])
  const [betNotifications, setBetNotifications] = useState<BetNotification[]>([])
  const [viewedNotificationIds, setViewedNotificationIds] = useState<string[]>([])
  const [clearedNotificationIds, setClearedNotificationIds] = useState<string[]>([])
  const [showPreviousNotifications, setShowPreviousNotifications] = useState(false)
  const pointsRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pointsRef.current && !pointsRef.current.contains(e.target as Node)) {
        setPointsOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const viewedNotificationsKey = user?._id
    ? `nitropicks-viewed-notifications-${user._id}`
    : null
  const clearedNotificationsKey = user?._id
    ? `nitropicks-cleared-notifications-${user._id}`
    : null
  const settledBaselineKey = user?._id
    ? `nitropicks-settled-notifications-baseline-${user._id}`
    : null

  useEffect(() => {
    if (!viewedNotificationsKey) {
      setViewedNotificationIds([])
      return
    }

    try {
      const saved = localStorage.getItem(viewedNotificationsKey)
      const parsed = saved ? JSON.parse(saved) : []
      setViewedNotificationIds(Array.isArray(parsed) ? parsed : [])
    } catch {
      setViewedNotificationIds([])
    }
  }, [viewedNotificationsKey])

  useEffect(() => {
    if (!clearedNotificationsKey) {
      setClearedNotificationIds([])
      return
    }

    try {
      const saved = localStorage.getItem(clearedNotificationsKey)
      const parsed = saved ? JSON.parse(saved) : []
      setClearedNotificationIds(Array.isArray(parsed) ? parsed : [])
    } catch {
      setClearedNotificationIds([])
    }
  }, [clearedNotificationsKey])

  useEffect(() => {
    if (!user?._id || user?.isAdmin || !settledBaselineKey) {
      setAllBetNotifications([])
      setBetNotifications([])
      return
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/bets/my/list', { credentials: 'include' })
        if (!res.ok) return

        const bets: NotificationBet[] = await res.json()
        const settledBets = bets
          .filter((bet) => bet.status === 'win' || bet.status === 'lose')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        const storedBaseline = localStorage.getItem(settledBaselineKey)

        if (!storedBaseline) {
          const initialBaseline = settledBets[0]?.createdAt ?? new Date().toISOString()
          localStorage.setItem(settledBaselineKey, initialBaseline)
          setAllBetNotifications([])
          setBetNotifications([])
          return
        }

        const notifications: BetNotification[] = settledBets
          .map((bet): BetNotification => {
            const firstLeg = bet.legs?.[0]
            const game = firstLeg?.gameId
            const homeTeam = typeof game === 'object' ? game?.homeTeam : ''
            const awayTeam = typeof game === 'object' ? game?.awayTeam : ''
            const chosenTeam =
              firstLeg?.team === 'home' ? homeTeam : firstLeg?.team === 'away' ? awayTeam : ''
            const selectionLabel = chosenTeam ? `${chosenTeam} WIN` : 'BET RESULT'

            const stake = Number(bet.stake)
            const expectedPayout = Number(bet.expectedPayout)
            const winAmount = Math.max(0, Math.round(expectedPayout - stake))
            const loseAmount = Math.max(0, Math.round(stake))
            const amount = bet.status === 'win' ? winAmount : loseAmount
            const amountPrefix = bet.status === 'win' ? '+' : '-'
            const verb = bet.status === 'win' ? 'WON' : 'LOST'
            const result: 'win' | 'lose' = bet.status === 'win' ? 'win' : 'lose'

            return {
              id: `${bet._id}:${bet.status}`,
              title: `${verb} - ${selectionLabel} ${amountPrefix}${amount} KP`,
              createdAt: bet.createdAt,
              result,
            }
          })

        setAllBetNotifications(notifications)

        const activeNotifications = notifications
          .filter((notification) => !clearedNotificationIds.includes(notification.id))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setBetNotifications(activeNotifications)
      } catch {
        setAllBetNotifications([])
        setBetNotifications([])
      }
    }

    fetchNotifications()
  }, [user?._id, user?.isAdmin, settledBaselineKey, notificationsOpen, clearedNotificationIds])

  const markNotificationsViewed = (notificationIds: string[]) => {
    if (!viewedNotificationsKey || notificationIds.length === 0) return

    setViewedNotificationIds((prev) => {
      const merged = Array.from(new Set([...prev, ...notificationIds]))
      localStorage.setItem(viewedNotificationsKey, JSON.stringify(merged))
      return merged
    })
  }

  const markNotificationsCleared = (notificationIds: string[]) => {
    if (!clearedNotificationsKey || notificationIds.length === 0) return

    setClearedNotificationIds((prev) => {
      const merged = Array.from(new Set([...prev, ...notificationIds]))
      localStorage.setItem(clearedNotificationsKey, JSON.stringify(merged))
      return merged
    })
  }

  const isNotificationViewed = (notification: BetNotification) => {
    if (viewedNotificationIds.includes(notification.id)) return true
    if (!settledBaselineKey) return false

    const storedBaseline = localStorage.getItem(settledBaselineKey)
    if (!storedBaseline) return false

    return new Date(notification.createdAt).getTime() <= new Date(storedBaseline).getTime()
  }

  const pendingNotificationCount = betNotifications.filter(
    (notification) => !isNotificationViewed(notification),
  ).length

  const handleToggleNotifications = () => {
    setNotificationsOpen((prev) => {
      const next = !prev
      if (next) {
        const unseenIds = betNotifications
          .filter((notification) => !isNotificationViewed(notification))
          .map((notification) => notification.id)
        markNotificationsViewed(unseenIds)
      }
      return next
    })
  }

  const handleClearNotifications = () => {
    const idsToClear = betNotifications.map((notification) => notification.id)
    markNotificationsCleared(idsToClear)
    setShowPreviousNotifications(false)
  }

  const previousNotifications = allBetNotifications
    .filter((notification) => clearedNotificationIds.includes(notification.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  useEffect(() => {
    const handleKpUpdate = () => {
      fetch('/api/users/me', { credentials: 'include' })
        .then((r) => r.json())
        .then((data) => { if (data._id) setUser(data) })
        .catch(() => {})
    }
    window.addEventListener('kp-updated', handleKpUpdate)
    return () => window.removeEventListener('kp-updated', handleKpUpdate)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me', {
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
      await fetch('/api/users/auth/logout', {
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
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-[46px] w-[110px] animate-pulse rounded-xl bg-zinc-800" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-800" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-800" />
              <div className="h-[38px] w-[90px] animate-pulse rounded-xl bg-zinc-800" />
            </div>
          ) : user ? (
            <>
              {/* KP DISPLAY */}
              <button className="flex h-10 items-center gap-2 rounded-xl border border-yellow-500/40 bg-[#0d0d0f] px-4 font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-yellow-400"
                >
                  <path d="M13 2L3 14h7v8l10-12h-7z" />
                </svg>

                <span className="min-w-[5ch] text-xl font-bold tabular-nums text-white">
                  {user?.knightPoints ?? 0}
                </span>

                <span className="text-sm text-zinc-300">KP</span>
              </button>

              {/* NOTIFICATIONS */}
              <div ref={notificationsRef} className="relative">
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  aria-label="Notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/70 bg-[#111216] text-white hover:border-yellow-400 hover:text-yellow-400 transition"
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
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9a6 6 0 10-12 0v.05c0 .236 0 .472-.002.708a8.967 8.967 0 01-2.312 6.014 23.848 23.848 0 005.454 1.31m5.717 0a24.255 24.255 0 01-5.717 0m5.717 0a3 3 0 11-5.717 0"
                    />
                  </svg>

                  {pendingNotificationCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      !
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[340px] rounded-xl border border-zinc-700 bg-[#14161d] p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      <div className="flex items-center gap-3">
                        {betNotifications.length === 0 && previousNotifications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowPreviousNotifications((prev) => !prev)}
                            className="text-xs font-semibold text-zinc-400 hover:text-yellow-400 transition"
                          >
                            {showPreviousNotifications ? 'Hide Previous Notifications' : 'Show Previous Notifications'}
                          </button>
                        )}
                        {betNotifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearNotifications}
                            className="text-xs font-semibold text-zinc-400 hover:text-yellow-400 transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {betNotifications.length === 0 ? (
                      showPreviousNotifications && previousNotifications.length > 0 ? (
                        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                          {previousNotifications.map((notification) => {
                            const outcomeClass =
                              notification.result === 'win'
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-red-500/30 bg-red-500/5'
                            const titleClass =
                              notification.result === 'win' ? 'text-green-300' : 'text-red-300'

                            return (
                              <div
                                key={`previous-${notification.id}`}
                                className={`rounded-lg border px-3 py-2 ${outcomeClass}`}
                              >
                                <p className={`text-sm font-semibold ${titleClass}`}>{notification.title}</p>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="rounded-lg bg-[#0f1118] px-3 py-2 text-sm text-zinc-400">
                          No notifications yet.
                        </p>
                      )
                    ) : (
                      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                        {betNotifications.slice(0, 12).map((notification) => {
                          const viewed = isNotificationViewed(notification)
                          const outcomeClass =
                            notification.result === 'win'
                              ? viewed
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-green-500/50 bg-green-500/10'
                              : viewed
                                ? 'border-red-500/30 bg-red-500/5'
                                : 'border-red-500/50 bg-red-500/10'
                          const titleClass =
                            notification.result === 'win' ? 'text-green-300' : 'text-red-300'

                          return (
                            <div
                              key={notification.id}
                              className={`rounded-lg border px-3 py-2 ${outcomeClass}`}
                            >
                              <p className={`text-sm font-semibold ${titleClass}`}>{notification.title}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PROFILE ICON */}
              <Link
                to="/profile"
                aria-label="View profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/70 bg-[#111216] text-white hover:border-yellow-400 hover:text-yellow-400 transition"
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
                className="h-10 rounded-xl border border-zinc-700 bg-[#111216] px-4 text-sm font-semibold text-white hover:border-red-400 hover:text-red-400 transition"
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
