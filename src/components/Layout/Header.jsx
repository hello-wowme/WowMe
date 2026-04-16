import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Menu, X, Bell, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ user }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const isHome = location.pathname === '/'

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
            { to: '/admin', label: '管理者' },
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
              <button className="relative p-2 rounded-full text-gray-400 hover:text-[#FE3B8C] hover:bg-pink-50 transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FE3B8C] rounded-full" />
              </button>

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
                                style={{ background: user.role === 'talent' ? 'linear-gradient(135deg, #0080FF, #3399FF)' : 'linear-gradient(135deg, #FE3B8C, #FF6BAE)' }}>
                                {user.role === 'talent' ? 'タレント' : 'ファン'}
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
                { to: '/admin', label: '管理者ダッシュボード' },
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
