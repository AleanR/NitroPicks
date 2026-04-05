import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const MarketsPage = lazy(() => import('./pages/MarketsPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const EarnPointsPage = lazy(() => import('./pages/EarnPointsPage'))
const RedeemPointsPage = lazy(() => import('./pages/RedeemPointsPage'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
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
          <Route path="/profile/:id" element={<UserProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App