import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronRight, Sparkles, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function MyPage() {
  const [tab, setTab] = useState('orders')
  const { user } = useAuth()

  const orders = [] // 実際の注文データ（将来的にAPIから取得）

  return (
    <div className="min-h-screen pt-24 pb-20 page-enter bg-[#F5F7FA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-10">
          <div className="relative">
            {user?.picture ? (
              <img src={user.picture} alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                {user?.name?.[0] || '?'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{user?.name || 'ゲスト'}</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                style={{ color: '#F59E0B', background: '#FFFBEB' }}>
                <Star className="w-3.5 h-3.5 fill-current" />
                ファンLv.1
              </span>
              <span className="text-xs text-gray-400">{orders.length}件のリクエスト</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: '合計リクエスト', value: orders.length, unit: '件' },
            { label: '受け取り済み', value: 0, unit: '件' },
            { label: '合計金額', value: '¥0', unit: '' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-2xl font-black text-gray-900">{value}<span className="text-sm font-normal text-gray-400">{unit}</span></p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ id: 'orders', label: '注文履歴' }, { id: 'wishlist', label: 'お気に入り' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
              style={tab === t.id ? {
                background: 'linear-gradient(135deg, #FE3B8C, #0080FF)',
                color: '#fff', boxShadow: '0 4px 16px rgba(254,59,140,0.3)',
              } : { background: '#fff', color: '#6B7280', border: '1.5px solid #F0F0F5' }}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {orders.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-24">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-6xl mb-5">🎬</motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">まだリクエストがありません</h3>
                  <p className="text-gray-400 text-sm mb-8">推しへの最初のリクエストを送ってみよう</p>
                  <Link to="/talents">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      className="btn-primary inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      タレントを探す
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* 将来的に注文リストをここに表示 */}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'wishlist' && (
            <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-24">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="text-6xl mb-5">💜</motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">お気に入りがありません</h3>
              <p className="text-gray-400 text-sm mb-8">気になるタレントをお気に入り登録しよう</p>
              <Link to="/talents">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary inline-flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  タレントを探す
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
