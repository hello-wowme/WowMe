import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Menu, X, Bell, LogOut, Settings, ChevronDown, CheckCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationsContext'

export default function Header({ user }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { notifications, unreadCount, markAllRead, markRead, isRead } = useNotifications()
  const isHome = location.pathname === '/'

  // ベル以外クリックで閉じる
  useEffect(() => {
    if (!bellOpen) return
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [bellOpen])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}
          >
            <Star className="w-4 h-4 text-white fill-white" />
          </motion.div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            Wow<span className="gradient-text">Me</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { to: '/talents', label: 'タレント一覧' },
            ...(user?.role === 'talent' ? [{ to: '/talent-dashboard', label: 'ダッシュボード' }] : []),
            ...(user ? [{ to: '/mypage', label: 'マイページ' }] : []),
            ...(user?.isAdmin ? [{ to: '/admin', label: '管理者' }] : []),
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-all duration-200 ${
                location.pathname === to ? 'text-[#FE3B8C]' : 'text-gray-500 hover:text-[#FE3B8C]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Bell */}
              <div className="relative" ref={bellRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => { setBellOpen(v => !v); if (!bellOpen) markAllRead() }}
                  className="relative p-2 rounded-full text-gray-400 hover:text-[#FE3B8C] hover:bg-pink-50 transition-all">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-white text-[10px] font-bold"
                      style={{ background: 'linear-gradient(135deg, #FE3B8C, #FF6BAE)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* 通知パネル */}
                <AnimatePresence>
                  {bellOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-30">

                      {/* ヘッダー */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4" style={{ color: '#FE3B8C' }} />
                          <p className="font-bold text-gray-900 text-sm">通知</p>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                              style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <button onClick={markAllRead}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#FE3B8C] transition-colors">
                            <CheckCheck className="w-3.5 h-3.5" />
                            すべて既読
                          </button>
                        )}
                      </div>

                      {/* 通知リスト */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-center py-10">
                            <div className="text-4xl mb-2">🔔</div>
                            <p className="text-gray-400 text-sm">通知はありません</p>
                          </div>
                        ) : (
                          notifications.map((n, i) => (
                            <motion.div
                              key={n.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => {
                                markRead(n.id)
                                if (n.link) { navigate(n.link); setBellOpen(false) }
                              }}
                              className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 transition-colors ${n.link ? 'cursor-pointer hover:bg-pink-50/50' : ''} ${!isRead(n.id) ? 'bg-pink-50/30' : ''}`}>
                              {/* 未読ドット */}
                              <div className="flex-shrink-0 mt-0.5 relative">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                                  style={{ background: !isRead(n.id) ? 'linear-gradient(135deg, #fff0f6, #f0f6ff)' : '#F5F7FA' }}>
                                  {n.emoji}
                                </div>
                                {!isRead(n.id) && (
                                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                                    style={{ background: '#FE3B8C' }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug mb-0.5 ${!isRead(n.id) ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-400 leading-relaxed">{n.body}</p>
                                <p className="text-xs text-gray-300 mt-1">{n.time?.slice(0, 10)}</p>
                              </div>
                              {n.link && (
                                <span className="text-xs font-medium flex-shrink-0 mt-1" style={{ color: '#FE3B8C' }}>→</span>
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full cursor-pointer hover:border-pink-200 transition-all"
                >
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                      {user.name?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-50">
                          <div className="flex items-center gap-3">
                            {user.picture ? (
                              <img src={user.picture} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                                {user.name?.[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{ background: user.isAdmin ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : user.role === 'talent' ? 'linear-gradient(135deg, #0080FF, #3399FF)' : 'linear-gradient(135deg, #FE3B8C, #FF6BAE)' }}>
                                {user.isAdmin ? '👑 管理者' : user.role === 'talent' ? 'タレント' : 'ファン'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          {user.role === 'talent' && (
                            <Link to="/talent-setup" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#FE3B8C] transition-colors">
                              <Settings className="w-4 h-4" />
                              プロフィール編集
                            </Link>
                          )}
                          <Link to="/mypage" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#FE3B8C] transition-colors">
                            <Star className="w-4 h-4" />
                            マイページ
                          </Link>
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                            ログアウト
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                ログイン / 登録
              </motion.button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <nav className="flex flex-col p-4 gap-1">
              {[
                { to: '/talents', label: 'タレント一覧' },
                ...(user ? [{ to: '/mypage', label: 'マイページ' }] : []),
                ...(user?.role === 'talent' ? [{ to: '/talent-dashboard', label: 'タレントダッシュボード' }] : []),
                ...(user?.isAdmin ? [{ to: '/admin', label: '管理者ダッシュボード' }] : []),
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-gray-600 hover:text-[#FE3B8C] hover:bg-pink-50 transition-all">
                  {label}
                </Link>
              ))}
              {user ? (
                <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                  className="px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-50 transition-all">
                  ログアウト
                </button>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-[#FE3B8C] font-medium hover:bg-pink-50 transition-all">
                  ログイン / 登録
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
