import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { Sparkles, Star, Music, Video, Users, ChevronRight, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import TermsModal from '../components/UI/TermsModal'
import PrivacyModal from '../components/UI/PrivacyModal'
import wowmeLogo from '../components/Layout/WowMe_Logo.svg'

const DEMO_USERS = {
  user: {
    sub: 'demo_user_001',
    name: '田中 花子',
    email: 'hanako@example.com',
    picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isDemo: true,
  },
  talent: {
    sub: 'demo_talent_001',
    name: '葉月 りの',
    email: 'rino@example.com',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    isDemo: true,
  },
}

export default function AuthPage() {
  const [role, setRole] = useState(null) // 'user' | 'talent'
  const [error, setError] = useState('')
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential)
      const userData = login(decoded, role)
      redirectAfterLogin(userData)
    } catch (e) {
      setError('Googleログインに失敗しました。もう一度お試しください。')
    }
  }

  const handleDemoLogin = () => {
    const profile = role === 'talent' ? DEMO_USERS.talent : DEMO_USERS.user
    const userData = login(profile, role)
    redirectAfterLogin(userData)
  }

  const redirectAfterLogin = (userData) => {
    if (userData.role === 'talent') {
      navigate('/talent-setup')
    } else {
      navigate('/talents')
    }
  }

  return (
    <>
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fff0f6 0%, #f0f6ff 55%, #f5f7fa 100%)' }}>

      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] -top-20 -left-20" style={{ background: 'rgba(254,59,140,0.10)' }} />
      <div className="orb w-[400px] h-[400px] -bottom-10 -right-10" style={{ background: 'rgba(0,128,255,0.08)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <img src={wowmeLogo} alt="WowMe" className="h-10 w-auto object-contain" />
          </motion.div>
          <p className="text-gray-400 text-base">推しとファンの距離をゼロにする</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {!role && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h2 className="text-2xl font-black text-gray-900 mb-2">はじめましょう</h2>
                <p className="text-gray-400 text-sm mb-8">あなたはどちらですか？</p>

                <div className="space-y-4">
                  {/* User Card */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole('user')}
                    className="w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all group"
                    style={{ borderColor: '#F0F0F5', background: '#FAFAFA' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FE3B8C'; e.currentTarget.style.background = '#fff0f6' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F0F5'; e.currentTarget.style.background = '#FAFAFA' }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #fff0f6, #ffe0f0)' }}>
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">ファン・ユーザー</p>
                      <p className="text-gray-400 text-sm mt-0.5">推しへのリクエストを送る</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#FE3B8C] transition-colors" />
                  </motion.button>

                  {/* Talent Card */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole('talent')}
                    className="w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all group"
                    style={{ borderColor: '#F0F0F5', background: '#FAFAFA' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#0080FF'; e.currentTarget.style.background = '#f0f6ff' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F0F5'; e.currentTarget.style.background = '#FAFAFA' }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #f0f6ff, #e0eeff)' }}>
                      ⭐
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">タレント・クリエイター</p>
                      <p className="text-gray-400 text-sm mt-0.5">ファンにメッセージを届ける</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#0080FF] transition-colors" />
                  </motion.button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-50">
                  {[
                    { icon: <Users className="w-4 h-4" />, value: '10,000+', label: 'ユーザー', color: '#FE3B8C' },
                    { icon: <Star className="w-4 h-4" />, value: '500+', label: 'タレント', color: '#0080FF' },
                    { icon: <Video className="w-4 h-4" />, value: '4.97', label: '平均評価', color: '#F59E0B' },
                  ].map(({ icon, value, label, color }) => (
                    <div key={label} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color }}>
                        {icon}
                        <span className="font-black text-sm text-gray-900">{value}</span>
                      </div>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Login */}
            {role && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* Back */}
                <button
                  onClick={() => { setRole(null); setError('') }}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
                >
                  ← 戻る
                </button>

                {/* Role Badge */}
                <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl"
                  style={{ background: role === 'talent' ? '#f0f6ff' : '#fff0f6' }}>
                  <span className="text-2xl">{role === 'talent' ? '⭐' : '👤'}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {role === 'talent' ? 'タレント・クリエイターとして登録' : 'ファンとして登録'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {role === 'talent' ? 'プロフィール設定後、リクエスト受付を開始できます' : 'Googleアカウントの名前・写真を使用します'}
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-2">ログイン / 新規登録</h2>
                <p className="text-gray-400 text-sm mb-8">Googleアカウントで続けましょう</p>

                {/* Google Login Button */}
                <div className="flex justify-center mb-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Googleログインに失敗しました')}
                    text="continue_with"
                    shape="pill"
                    size="large"
                    width="320"
                    locale="ja"
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-300">または</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Demo Login */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDemoLogin}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed text-sm font-medium transition-all"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FE3B8C'; e.currentTarget.style.color = '#FE3B8C' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
                >
                  <Zap className="w-4 h-4" />
                  デモアカウントでログイン
                </motion.button>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs text-center mt-4"
                  >
                    {error}
                  </motion.p>
                )}

                <p className="text-xs text-gray-300 text-center mt-6 leading-relaxed">
                  続けることで
                  <button onClick={() => setShowTerms(true)} className="underline hover:text-gray-500 transition-colors">利用規約</button>
                  と
                  <button onClick={() => setShowPrivacy(true)} className="underline hover:text-gray-500 transition-colors">プライバシーポリシー</button>
                  に同意します
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
    {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  )
}
