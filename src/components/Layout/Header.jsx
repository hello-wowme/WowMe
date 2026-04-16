import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Menu, X, Bell } from 'lucide-react'

export default function Header({ user }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

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
            { to: '/mypage', label: 'マイページ' },
            { to: '/talent-dashboard', label: 'タレント' },
            { to: '/admin', label: '管理者' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-all duration-200 ${
                location.pathname === to
                  ? 'text-[#FE3B8C]'
                  : 'text-gray-500 hover:text-[#FE3B8C]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-full text-gray-400 hover:text-[#FE3B8C] hover:bg-pink-50 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FE3B8C] rounded-full" />
          </button>

          <Link to="/mypage">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full cursor-pointer hover:border-pink-200 transition-all"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                花
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
            </motion.div>
          </Link>

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
                { to: '/mypage', label: 'マイページ' },
                { to: '/talent-dashboard', label: 'タレントダッシュボード' },
                { to: '/admin', label: '管理者ダッシュボード' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-gray-600 hover:text-[#FE3B8C] hover:bg-pink-50 transition-all"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
