import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, DollarSign, Video, Star, Clock, CheckCircle, Upload, Eye } from 'lucide-react'
import { mockOrders, talents } from '../data/mockData'

const talent = talents[0]

export default function TalentDashboard() {
  const [activeTab, setActiveTab] = useState('requests')
  const [uploadModal, setUploadModal] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const orders = mockOrders

  const stats = [
    { label: '今月の収益', value: '¥32,000', icon: <DollarSign className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #10B981, #34D399)', shadow: 'rgba(16,185,129,0.25)', trend: '+24%' },
    { label: '新着リクエスト', value: orders.filter(o => o.status === 'pending').length, icon: <Clock className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)', shadow: 'rgba(245,158,11,0.25)', trend: '3件' },
    { label: '完了動画', value: orders.filter(o => o.status === 'completed').length, icon: <Video className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #FE3B8C, #FF6BAE)', shadow: 'rgba(254,59,140,0.25)', trend: 'today' },
    { label: '平均評価', value: '4.98', icon: <Star className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #0080FF, #3399FF)', shadow: 'rgba(0,128,255,0.25)', trend: '⭐⭐⭐⭐⭐' },
  ]

  const handleUpload = async (orderId) => {
    setUploading(true); setUploadProgress(0)
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60))
      setUploadProgress(i)
    }
    setUploading(false); setUploadModal(null); setUploadProgress(0)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 page-enter bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-10">
          <img src={talent.avatar} alt={talent.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" />
          <div>
            <p className="text-gray-400 text-sm mb-1">タレントダッシュボード</p>
            <h1 className="text-2xl font-black text-gray-900">{talent.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">受付中</span>
              <span className="text-gray-300 mx-1">|</span>
              <span className="text-sm text-gray-400">¥{talent.price.toLocaleString()} / リクエスト</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon, gradient, shadow, trend }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                style={{ background: gradient, boxShadow: `0 4px 16px ${shadow}` }}>
                {icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              <p className="text-xs text-green-500 mt-1 font-medium">{trend}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 mb-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">収益推移</h2>
            <select className="text-xs text-gray-400 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none">
              <option>過去30日</option>
              <option>過去90日</option>
            </select>
          </div>
          <div className="flex items-end gap-2 h-24">
            {[3, 5, 4, 8, 6, 9, 7, 11, 8, 13, 10, 14, 12, 16].map((v, i) => (
              <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ delay: 0.3 + i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: `${v * 6}px`, transformOrigin: 'bottom' }}
                className="flex-1">
                <div className="w-full h-full rounded-t-lg"
                  style={{
                    background: i === 13 ? 'linear-gradient(to top, #FE3B8C, #0080FF)' : '#F0F2FF',
                    boxShadow: i === 13 ? '0 -4px 16px rgba(254,59,140,0.3)' : 'none',
                  }} />
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-300 mt-2">
            <span>11/1</span><span>11/14</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'requests', label: 'リクエスト', count: orders.filter(o => o.status !== 'completed').length },
            { id: 'completed', label: '完了済み', count: orders.filter(o => o.status === 'completed').length },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={activeTab === t.id ? {
                background: 'linear-gradient(135deg, #FE3B8C, #0080FF)',
                color: '#fff', boxShadow: '0 4px 16px rgba(254,59,140,0.3)'
              } : { background: '#fff', color: '#6B7280', border: '1.5px solid #F0F0F5' }}>
              {t.label}
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={activeTab === t.id ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: '#F5F7FA', color: '#9CA3AF' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {orders.filter(o => activeTab === 'requests' ? o.status !== 'completed' : o.status === 'completed').map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-300">{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={order.status === 'pending'
                        ? { background: '#FFFBEB', color: '#F59E0B' }
                        : order.status === 'processing'
                          ? { background: '#EFF6FF', color: '#3B82F6' }
                          : { background: '#F0FDF4', color: '#10B981' }}>
                      {order.status === 'pending' ? '新着' : order.status === 'processing' ? '制作中' : '完了'}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">{order.occasion}</p>
                  <p className="text-sm text-gray-400">受取人: {order.recipientName}</p>
                </div>
                <p className="text-xl font-black text-gray-900">¥{order.price.toLocaleString()}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">メッセージ内容</p>
                <p className="text-sm text-gray-600 leading-relaxed">{order.message}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-300">{order.createdAt}</p>
                {order.status !== 'completed' ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setUploadModal(order.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)', boxShadow: '0 4px 16px rgba(254,59,140,0.3)' }}>
                    <Upload className="w-4 h-4" />
                    動画をアップロード
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    完了済み
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setUploadModal(null) }}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">動画をアップロード</h3>
              <p className="text-gray-400 text-sm mb-6">注文 {uploadModal} への返答動画</p>

              {!uploading && uploadProgress === 0 ? (
                <>
                  <div onClick={() => handleUpload(uploadModal)}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center mb-6 hover:border-pink-300 transition-colors cursor-pointer group">
                    <Upload className="w-10 h-10 text-gray-300 group-hover:text-[#FE3B8C] mx-auto mb-3 transition-colors" />
                    <p className="text-gray-500 text-sm">クリックして動画を選択</p>
                    <p className="text-gray-300 text-xs mt-1">MP4, MOV 最大500MB</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setUploadModal(null)} className="btn-ghost flex-1 py-3 text-sm">キャンセル</button>
                    <button onClick={() => handleUpload(uploadModal)} className="btn-primary flex-1 py-3 text-sm">アップロード</button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>アップロード中...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${uploadProgress}%` }} className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #FE3B8C, #0080FF)' }} />
                    </div>
                  </div>
                  {uploadProgress === 100 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-900 font-semibold">アップロード完了！</p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
