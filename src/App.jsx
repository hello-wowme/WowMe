import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TalentsProvider } from './context/TalentsContext'
import LandingPage from './pages/LandingPage'
import TalentListPage from './pages/TalentListPage'
import TalentDetailPage from './pages/TalentDetailPage'
import RequestFlowPage from './pages/RequestFlowPage'
import VideoRevealPage from './pages/VideoRevealPage'
import TalentDashboard from './pages/TalentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MyPage from './pages/MyPage'
import AuthPage from './pages/AuthPage'
import TalentProfileSetup from './pages/TalentProfileSetup'
import Header from './components/Layout/Header'

// Google Client ID - 実際の値に置き換えてください
// https://console.cloud.google.com/ で取得
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-placeholder.apps.googleusercontent.com'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace />
  if (!user.isAdmin) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to={user.role === 'talent' ? '/talent-dashboard' : '/talents'} replace /> : <AuthPage />} />
        <Route path="/talent-setup" element={<ProtectedRoute><TalentProfileSetup /></ProtectedRoute>} />
        <Route path="/talents" element={<TalentListPage />} />
        <Route path="/talent/:id" element={<TalentDetailPage />} />
        <Route path="/request/:id" element={<ProtectedRoute><RequestFlowPage /></ProtectedRoute>} />
        <Route path="/reveal/:orderId" element={<ProtectedRoute><VideoRevealPage /></ProtectedRoute>} />
        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/talent-dashboard" element={<ProtectedRoute><TalentDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TalentsProvider>
          <Router>
            <div className="min-h-screen bg-[#F5F7FA]">
              <AppRoutes />
            </div>
          </Router>
        </TalentsProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
