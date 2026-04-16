import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Clock, CheckCircle, AlertCircle, Gift, Star, ChevronRight } from 'lucide-react'
import { mockOrders } from '../data/mockData'

const STATUS_MAP = {
  completed: { label: '受取済み', color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0', icon: <CheckCircle className="w-4 h-4" /> },
  processing: { label: '制作中', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', icon: <Clock className="w-4 h-4" /> },
  pending: { label: 'リクエスト中', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: <AlertCircle className="w-4 h-4" /> },
}

export default function MyPage() {
  const [tab, setTab] = useState('orders')

  return (
    <div className="min-h-screen pt-24 pb-20 page-enter bg-[#F5F7FA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
            花
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">田中 花子</h1>
            <p className="text-gray-400 text-sm">@hanako_tanaka</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                style={{ color: '#F59E0B', background: '#FFFBEB' }}>
                <Star className="w-3.5 h-3.5 fill-current" />
                ファンLv.3
              </span>
              <span className="text-xs text-gray-400">{mockOrders.length}件のリクエスト</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: '合計リクエスト', value: mockOrders.length, unit: '件' },
            { label: '受け取り済み', value: mockOrders.filter(o => o.status === 'completed').length, unit: '件' },
            { label: '合計金額', value: `¥${mockOrders.reduce((s, o) => s + o.price, 0).toLocaleString()}`, unit: '' },
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
                color: '#fff',
                boxShadow: '0 4px 16px rgba(254,59,140,0.3)',
              } : {
                background: '#fff',
                color: '#6B7280',
                border: '1.5px solid #F0F0F5',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {mockOrders.map((order, i) => {
                const status = STATUS_MAP[order.status]
                return (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-4">
                      <img src={order.talentAvatar} alt={order.talentName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-bold text-gray-900">{order.talentName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs">
                                <Gift className="w-3 h-3" style={{ color: '#FE3B8C' }} />
                                <span className="text-gray-500">{order.occasion}</span>
                              </span>
                              {order.recipientName && (
                                <><span className="text-gray-200">·</span><span className="text-xs text-gray-400">→ {order.recipientName}</span></>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-gray-900 flex-shrink-0">¥{order.price.toLocaleString()}</p>
                        </div>

                        <p className="text-xs text-gray-400 mb-3 line-clamp-1">{order.message}</p>

                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                            style={{ color: status.color, background: status.bg, borderColor: status.border }}>
                            {status.icon}
                            {status.label}
                          </span>
                          {order.status === 'completed' ? (
                            <Link to={`/reveal/${order.id}`}>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                                <Play className="w-3.5 h-3.5 fill-white" />
                                再生
                              </motion.button>
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-300">{order.createdAt}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center pt-6">
                <Link to="/talents">
                  <motion.button whileHover={{ scale: 1.04 }} className="btn-primary inline-flex items-center gap-2">
                    新しいリクエストをする <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          )}

          {tab === 'wishlist' && (
            <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-20">
              <div className="text-5xl mb-4">💜</div>
              <p className="text-gray-400">まだお気に入りがありません</p>
              <Link to="/talents" className="mt-4 inline-block text-sm transition-colors hover:opacity-70" style={{ color: '#FE3B8C' }}>
                タレントを探す →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
