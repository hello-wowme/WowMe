import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronRight, Sparkles, Heart, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchOrdersByUser, dbOrderToApp } from '../lib/db'
import { useFavorites } from '../context/FavoritesContext'
import LevelBadge from '../components/UI/LevelBadge'

const STATUS_MAP = {
  pending:    { label: '審査待ち',  color: '#F59E0B', bg: '#FFFBEB', icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: '制作中',    color: '#0080FF', bg: '#EFF6FF', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  completed:  { label: '完了',      color: '#10B981', bg: '#F0FDF4', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected:   { label: '却下',      color: '#EF4444', bg: '#FEF2F2', icon: <AlertCircle className="w-3.5 h-3.5" /> },
}

export default function MyPage() {
  const [tab, setTab] = useState('orders')
  const { user } = useAuth()
  const { favorites, toggleFavorite } = useFavorites()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoadingOrders(false); return }
    fetchOrdersByUser(user.id).then(({ data, error }) => {
      if (!error && data) setOrders(data.map(dbOrderToApp))
      setLoadingOrders(false)
    })
  }, [user?.id])

  const OCCASION_EMOJI = {
    birthday: '🎂', graduation: '🎓', cheering: '📣',
    anniversary: '💍', gift: '🎁', just_for_me: '⭐',
    wedding: '💒', other: '💫',
  }

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
          {[{ id: 'orders', label: '注文履歴' }, { id: 'wishlist', label: `お気に入り (${favorites.length})` }].map(t => (
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
                  {orders.map((order, i) => {
                    const st = STATUS_MAP[order.status] || STATUS_MAP.pending
                    const emoji = OCCASION_EMOJI[order.occasion] ?? '💫'
                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        {/* タレント情報ヘッダー */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                          {order.talentAvatar
                            ? <img src={order.talentAvatar} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                            : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg,#FE3B8C,#0080FF)' }}>
                                {order.talentName?.[0] ?? '?'}
                              </div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900">{order.talentName || '—'}</p>
                            <p className="text-xs text-gray-400">{order.talentCategory}</p>
                          </div>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                            style={{ color: st.color, background: st.bg }}>
                            {st.icon}{st.label}
                          </span>
                        </div>
                        {/* 注文詳細 */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{emoji}</span>
                            <span className="text-xs font-medium text-gray-500">{order.occasion}</span>
                            <span className="text-gray-200 mx-1">·</span>
                            <span className="text-xs text-gray-400">{order.createdAt?.slice(0,10)}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{order.message}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-base font-black text-gray-900">¥{order.price?.toLocaleString()}</p>
                            {order.status === 'completed' && order.videoUrl && (
                              <Link to={`/reveal/${order.id}`}>
                                <motion.button whileHover={{ scale: 1.03 }} className="btn-primary px-4 py-2 text-xs">
                                  動画を見る
                                </motion.button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'wishlist' && (
            <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {favorites.length === 0 ? (
                <div className="text-center py-24">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
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
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((talent, i) => (
                    <motion.div key={talent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
                      <Link to={`/talent/${talent.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                        {talent.avatar
                          ? <img src={talent.avatar} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                          : <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#FE3B8C,#0080FF)' }}>
                              {talent.name?.[0]}
                            </div>
                        }
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-gray-900">{talent.name}</p>
                            {talent.level && <LevelBadge level={talent.level} size="sm" />}
                          </div>
                          <p className="text-xs text-gray-400">{talent.category}</p>
                          <p className="text-sm font-semibold mt-1" style={{ color: '#FE3B8C' }}>
                            ¥{talent.price?.toLocaleString()}〜
                          </p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/request/${talent.id}`}>
                          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            className="btn-primary px-4 py-2 text-xs">
                            リクエスト
                          </motion.button>
                        </Link>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
                          onClick={() => toggleFavorite(talent)}
                          className="p-2 rounded-xl border transition-all"
                          style={{ background: '#fff0f6', borderColor: '#FE3B8C44', color: '#FE3B8C' }}>
                          <Heart className="w-4 h-4 fill-current" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
