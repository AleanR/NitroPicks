import { useLocation } from 'react-router-dom'

function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/' && location.pathname === '/home')
  }

  return (
    <nav className="hidden items-center gap-8 md:flex">
      <a
        href="/"
        className={`font-medium transition ${
          isActive('/') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
        }`}
      >
        Home
      </a>
      <a
        href="/markets"
        className={`font-medium transition ${
          isActive('/markets') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
        }`}
      >
        Markets
      </a>
      <a
        href="/leaderboard"
        className={`font-medium transition ${
          isActive('/leaderboard') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
        }`}
      >
        Leaderboard
      </a>
    </nav>
  )
}

export default Navigation
