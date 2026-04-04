import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MarketsPage from './pages/MarketsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import EarnPointsPage from './pages/EarnPointsPage'
import RedeemPointsPage from './pages/RedeemPointsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/earn-points" element={<EarnPointsPage />} />
        <Route path="/redeem-points" element={<RedeemPointsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App