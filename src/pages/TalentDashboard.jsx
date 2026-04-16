import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Video, Star, Clock, CheckCircle, Upload, X, Sparkles, Settings, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function TalentDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('requests')
  const [uploadModal, setUploadModal] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const talentProfile = user?.talentProfile || null
  const orders = [] // 将来的にAPIから取得

  const stats = [
    { label: '今月の収益', value: '¥0', icon: <DollarSign className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #10B981, #34D399)', shadow: 'rgba(16,185,129,0.25)', trend: '—' },
    { label: '新着リクエスト', value: 0, icon: <Clock className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)', shadow: 'rgba(245,158,11,0.25)', trend: '—' },
    { label: '完了動画', value: 0, icon: <Video className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #FE3B8C, #FF6BAE)', shadow: 'rgba(254,59,140,0.25)', trend: '—' },
    { label: '平均評価', value: '—', icon: <Star className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #0080FF, #3399FF)', shadow: 'rgba(0,128,255,0.25)', trend: '—' },
  ]

  const handleUpload = async () => {
    setUploading(true)
    setUploadProgress(0)
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60))
      setUploadProgress(i)
    }
    setUploading(false)
    setUploadModal(null)
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 page-enter bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-10">
          <div className="relative">
            {(talentProfile?.avatar || user?.picture) ? (
              <img src={talentProfile?.avatar || user?.picture} alt={user?.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                {user?.name?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-sm mb-1">タレントダッシュボード</p>
            <h1 className="text-2xl font-black text-gray-900">{talentProfile?.displayName || user?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {talentProfile?.setupComplete ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 font-medium">受付中</span>
                  <span className="text-gray-300 mx-1">|</span>
                  <span className="text-sm text-gray-400">¥{Number(talentProfile.price).toLocaleString()} / リクエスト</span>
                </>
              ) : (
                <span className="text-sm text-amber-500 font-medium">⚠️ プロフィール未設定</span>
              )}
            </div>
          </div>
          <Link to="/talent-setup">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:text-[#FE3B8C] transition-all shadow-sm">
              <Settings className="w-4 h-4" />
              プロフィール編集
            </motion.button>
          </Link>
        </motion.div>

        {/* Profile Incomplete Banner */}
        {!talentProfile?.setupComplete && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-8 flex items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg, #fff0f6, #f0f6ff)', border: '1.5px solid #FE3B8C22' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">プロフィールを設定してリクエストを受け付けよう</p>
                <p className="text-xs text-gray-400 mt-0.5">画像・料金・サンプル動画を追加するとファンが見つけやすくなります</p>
              </div>
            </div>
            <Link to="/talent-setup">
              <motion.button whileHover={{ scale: 1.04 }} className="btn-primary px-5 py-2.5 text-sm flex-shrink-0 flex items-center gap-2">
                設定する <ChevronRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon, gradient, shadow, trend }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }} whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                style={{ background: gradient, boxShadow: `0 4px 16px ${shadow}` }}>
                {icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              <p className="text-xs text-gray-300 mt-1">{trend}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'requests', label: 'リクエスト', count: 0 },
            { id: 'completed', label: '完了済み', count: 0 },
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

        {/* Empty State */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {orders.length === 0 && (
              <motion.div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-6xl mb-5">
                  {activeTab === 'requests' ? '📬' : '🎬'}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {activeTab === 'requests' ? 'まだリクエストがありません' : '完了した動画はありません'}
                </h3>
                <p className="text-gray-400 text-sm mb-8">
                  {activeTab === 'requests'
                    ? 'プロフィールを公開するとファンからリクエストが届きます'
                    : '動画を完成させるとここに表示されます'}
                </p>
                {activeTab === 'requests' && !talentProfile?.setupComplete && (
                  <Link to="/talent-setup">
                    <motion.button whileHover={{ scale: 1.04 }} className="btn-primary inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      プロフィールを設定する
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setUploadModal(null) }}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">動画をアップロード</h3>
              <p className="text-gray-400 text-sm mb-6">注文 {uploadModal} への返答動画</p>
              {!uploading && uploadProgress === 0 ? (
                <>
                  <div onClick={() => handleUpload()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center mb-6 hover:border-[#FE3B8C] hover:bg-pink-50 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">クリックして動画を選択</p>
                    <p className="text-gray-300 text-xs mt-1">MP4, MOV 最大500MB</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setUploadModal(null)} className="btn-ghost flex-1 py-3 text-sm">キャンセル</button>
                    <button onClick={handleUpload} className="btn-primary flex-1 py-3 text-sm">アップロード</button>
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
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-800 font-semibold">アップロード完了！</p>
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
