import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import TalentListPage from './pages/TalentListPage'
import TalentDetailPage from './pages/TalentDetailPage'
import RequestFlowPage from './pages/RequestFlowPage'
import VideoRevealPage from './pages/VideoRevealPage'
import TalentDashboard from './pages/TalentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MyPage from './pages/MyPage'
import Header from './components/Layout/Header'

export default function App() {
  const [currentUser] = useState({ name: '田中 花子', role: 'user' })

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0014]">
        <Header user={currentUser} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/talents" element={<TalentListPage />} />
          <Route path="/talent/:id" element={<TalentDetailPage />} />
          <Route path="/request/:id" element={<RequestFlowPage />} />
          <Route path="/reveal/:orderId" element={<VideoRevealPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/talent-dashboard" element={<TalentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}
