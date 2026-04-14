import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

const LoginPage          = lazy(() => import('./pages/LoginPage'))
const HomePage           = lazy(() => import('./pages/HomePage'))
const MarketsPage        = lazy(() => import('./pages/MarketsPage'))
const LeaderboardPage    = lazy(() => import('./pages/LeaderboardPage'))
const ProfilePage        = lazy(() => import('./pages/profile/ProfilePage'))
const RegisterPage       = lazy(() => import('./pages/RegisterPage'))
const AdminPage          = lazy(() => import('./pages/AdminPage'))
const EarnPointsPage     = lazy(() => import('./pages/EarnPointsPage'))
const RedeemPointsPage   = lazy(() => import('./pages/RedeemPointsPage'))
const UserProfilePage    = lazy(() => import('./pages/UserProfilePage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'))
const VerifyEmailPage    = lazy(() => import('./pages/VerifyEmailPage'))

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            {/* Public-only routes — redirect to / if already logged in */}
            <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register"       element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

            {/* Fully public routes */}
            <Route path="/verify-email"   element={<VerifyEmailPage />} />
            <Route path="/leaderboard"    element={<LeaderboardPage />} />
            <Route path="/profile/:id"    element={<UserProfilePage />} />

            {/* Protected routes — redirect to /login if not authenticated */}
            <Route path="/"              element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/markets"       element={<ProtectedRoute><MarketsPage /></ProtectedRoute>} />
            <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin"         element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/earn-points"   element={<ProtectedRoute><EarnPointsPage /></ProtectedRoute>} />
            <Route path="/redeem-points" element={<ProtectedRoute><RedeemPointsPage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
