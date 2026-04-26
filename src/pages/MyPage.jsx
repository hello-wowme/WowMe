import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, ChevronRight, Sparkles, Heart, Clock, CheckCircle, AlertCircle,
  DollarSign, Video, Bell, BellOff, Settings, TrendingUp, Award,
  Upload, X, Package, LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchOrdersByUser, fetchOrdersByTalentUserId, dbOrderToApp, updateOrderStatus, uploadVideo } from '../lib/db'
import { useFavorites } from '../context/FavoritesContext'
import { useTalents } from '../context/TalentsContext'
import LevelBadge from '../components/UI/LevelBadge'
import { getLevelInfo, getLevelProgress, calcLevel } from '../utils/talentLevel'

const STATUS_MAP = {
  pending:    { label: '審査待ち',  color: '#F59E0B', bg: '#FFFBEB', icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: '制作中',    color: '#0080FF', bg: '#EFF6FF', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  completed:  { label: '完了',      color: '#10B981', bg: '#F0FDF4', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected:   { label: '却下',      color: '#EF4444', bg: '#FEF2F2', icon: <AlertCircle className="w-3.5 h-3.5" /> },
}

const OCCASION_EMOJI = {
  birthday: '🎂', graduation: '🎓', cheering: '📣',
  anniversary: '💍', gift: '🎁', just_for_me: '⭐',
  wedding: '💒', other: '💫',
}

export default function MyPage() {
  const { user, updateProfile } = useAuth()
  const { favorites, toggleFavorite } = useFavorites()
  const { registerTalent } = useTalents()

  const talentProfile = user?.talentProfile || null
  const isTalent = !!talentProfile?.setupComplete

  const defaultTab = isTalent ? 'dashboard' : 'orders'
  const [tab, setTab] = useState(defaultTab)

  const [orders, setOrders] = useState([])
  const [talentOrders, setTalentOrders] = useState([])
  const [dbProfile, setDbProfile] = useState(null)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [dashTab, setDashTab] = useState('pending')
  const [uploadModal, setUploadModal] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadInputMode, setUploadInputMode] = useState('file') // 'file' | 'url'

  const isAvailable = talentProfile?.available !== false

  useEffect(() => {
    if (!user?.id) { setLoadingOrders(false); return }
    fetchOrdersByUser(user.id).then(({ data, error }) => {
      if (!error && data) setOrders(data.map(dbOrderToApp))
      setLoadingOrders(false)
    })
    if (isTalent) {
      fetchOrdersByTalentUserId(user.id).then(({ data: ords }) => {
        if (ords) setTalentOrders(ords.map(dbOrderToApp))
      })
    }
  }, [user?.id])

  // ─── ダッシュボード計算 ─────────────────────────────────────
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthRevenue = talentOrders.filter(o => o.status === 'completed' && o.createdAt?.startsWith(thisMonth))
    .reduce((s, o) => s + (o.price || 0), 0)
  const pendingOrders    = talentOrders.filter(o => o.status === 'pending')
  const processingOrders = talentOrders.filter(o => o.status === 'processing')
  const completedOrders  = talentOrders.filter(o => o.status === 'completed')
  const completionRate   = talentOrders.length > 0
    ? Math.round((completedOrders.length / talentOrders.length) * 100) : 0
  const avgRating = dbProfile?.rating ? Number(dbProfile.rating).toFixed(1) : '—'

  // レベル
  const totalOrders = talentProfile?.totalOrders || 0
  const rating = talentProfile?.rating || 0
  const level = talentProfile?.level || calcLevel(totalOrders, rating)
  const levelInfo = getLevelInfo(level)
  const levelProgress = getLevelProgress(level, totalOrders, rating)

  const dashStats = [
    { label: '今月の収益',         value: `¥${monthRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, gradient: 'linear-gradient(135deg,#10B981,#34D399)', shadow: 'rgba(16,185,129,0.25)' },
    { label: '審査待ち',           value: pendingOrders.length,                icon: <Clock className="w-5 h-5" />,       gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)', shadow: 'rgba(245,158,11,0.25)' },
    { label: '完了動画',           value: completedOrders.length,              icon: <Video className="w-5 h-5" />,       gradient: 'linear-gradient(135deg,#FE3B8C,#FF6BAE)', shadow: 'rgba(254,59,140,0.25)' },
    { label: '完了率',             value: `${completionRate}%`,                icon: <Star className="w-5 h-5" />,        gradient: 'linear-gradient(135deg,#0080FF,#3399FF)', shadow: 'rgba(0,128,255,0.25)' },
  ]

  const dashTabs = [
    { id: 'pending',    label: '審査待ち', count: pendingOrders.length },
    { id: 'processing', label: '制作中',   count: processingOrders.length },
    { id: 'completed',  label: '完了',     count: completedOrders.length },
  ]
  const currentDashOrders = dashTab === 'pending' ? pendingOrders
    : dashTab === 'processing' ? processingOrders : completedOrders

  const handleToggleAvailable = () => {
    const newAvailable = !isAvailable
    const updated = { ...talentProfile, available: newAvailable }
    updateProfile({ talentProfile: updated })
    if (user?.id) registerTalent(user.id, updated)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus)
    setTalentOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  }

  const handleUpload = async () => {
    const orderId = uploadModal
    let videoUrl = ''

    if (uploadInputMode === 'url') {
      if (!uploadUrl.trim()) return
      videoUrl = uploadUrl.trim()
      // URL モードはアニメのみ
      setUploading(true)
      setUploadProgress(0)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 80))
        setUploadProgress(i)
      }
    } else {
      if (!uploadFile) return
      setUploading(true)
      setUploadProgress(0)

      // Supabase Storage があればアップロード、なければ ObjectURL を使用
      const { url, error } = await uploadVideo(orderId, uploadFile)
      if (error || !url) {
        // localStorage モード: objectURL（同セッション内のみ有効）
        videoUrl = URL.createObjectURL(uploadFile)
      } else {
        videoUrl = url
      }
      setUploadProgress(100)
    }

    // 注文ステータスを completed + videoUrl に更新
    await updateOrderStatus(orderId, 'completed', videoUrl)
    setTalentOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'completed', videoUrl } : o
    ))
    setUploading(false)
    setTimeout(() => {
      setUploadModal(null)
      setUploadProgress(0)
      setUploadFile(null)
      setUploadUrl('')
      setUploadInputMode('file')
    }, 1200)
  }

  const handleUploadFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setUploadFile(file)
  }

  const tabs = [
    ...(isTalent ? [{ id: 'dashboard', label: 'ダッシュボード', icon: <LayoutDashboard className="w-3.5 h-3.5" /> }] : []),
    { id: 'orders',    label: '注文履歴' },
    { id: 'wishlist',  label: `お気に入り (${favorites.length})` },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 page-enter bg-[#F5F7FA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Profile Header */}
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
            <h1 className="text-2xl font-black text-gray-900">{user?.name || 'ゲスト'}</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {user?.email === 'hello.wowme@gmail.com' ? (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ color: '#7C3AED', background: '#F5F3FF' }}>
                  👑 管理者
                </span>
              ) : isTalent ? (
                <LevelBadge level={level} size="sm" />
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ color: '#F59E0B', background: '#FFFBEB' }}>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  ファンLv.1
                </span>
              )}
              <span className="text-xs text-gray-400">{orders.length}件のリクエスト</span>
            </div>
          </div>
          {isTalent && (
            <Link to="/talent-setup">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:text-[#FE3B8C] transition-all shadow-sm">
                <Settings className="w-3.5 h-3.5" />
                編集
              </motion.button>
            </Link>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={tab === t.id ? {
                background: 'linear-gradient(135deg, #FE3B8C, #0080FF)',
                color: '#fff', boxShadow: '0 4px 16px rgba(254,59,140,0.3)',
              } : { background: '#fff', color: '#6B7280', border: '1.5px solid #F0F0F5' }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ─── ダッシュボード ─── */}
          {tab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">

              {/* 受付トグル */}
              <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: isAvailable ? '#F0FDF4' : '#F9FAFB' }}>
                    {isAvailable
                      ? <Bell className="w-5 h-5 text-green-500" />
                      : <BellOff className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {isAvailable ? 'リクエスト受付中' : 'リクエスト受付終了'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isAvailable ? 'オフにするとリクエストが停止します' : 'オンにするとリクエストを再開します'}
                    </p>
                  </div>
                </div>
                <motion.button onClick={handleToggleAvailable} whileTap={{ scale: 0.95 }}
                  className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
                  style={{ background: isAvailable ? '#10B981' : '#D1D5DB' }}>
                  <motion.div
                    animate={{ x: isAvailable ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                </motion.button>
              </div>

              {/* サマリーカード */}
              <div className="grid grid-cols-2 gap-4">
                {dashStats.map(({ label, value, icon, gradient, shadow }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-3"
                      style={{ background: gradient, boxShadow: `0 4px 12px ${shadow}` }}>
                      {icon}
                    </div>
                    <p className="text-2xl font-black text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </motion.div>
                ))}
              </div>

              {/* レベルパネル */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-6 border"
                style={{ background: levelInfo.bgColor, borderColor: levelInfo.borderColor, boxShadow: `0 4px 24px ${levelInfo.glowColor}` }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: levelInfo.color }}>現在のランク</p>
                    <LevelBadge level={level} size="lg" />
                    <p className="text-xs mt-2" style={{ color: levelInfo.textColor }}>{levelInfo.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">報酬率</p>
                    <p className="text-3xl font-black" style={{ color: levelInfo.color }}>
                      {Math.round(levelInfo.talentShare * 100)}%
                    </p>
                    <p className="text-xs text-gray-400">運営 {Math.round(levelInfo.platformShare * 100)}%</p>
                  </div>
                </div>
                {levelProgress ? (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium" style={{ color: levelInfo.textColor }}>
                        次：Lv{levelProgress.nextLevel} {levelProgress.nextLevelInfo.label} {levelProgress.nextLevelInfo.emoji}
                      </span>
                      <span style={{ color: levelInfo.color }}>{Math.round(levelProgress.orderProgress * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress.orderProgress * 100}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: levelInfo.gradient }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${totalOrders >= levelProgress.ordersNeeded ? 'text-green-600' : 'text-gray-500'}`}>
                        {totalOrders >= levelProgress.ordersNeeded ? '✅' : '📦'}
                        注文 {totalOrders}/{levelProgress.ordersNeeded}件
                        {levelProgress.orderRemaining > 0 && <span className="text-gray-400">（あと{levelProgress.orderRemaining}件）</span>}
                      </span>
                      {levelProgress.ratingNeeded && (
                        <span className={`flex items-center gap-1 ${levelProgress.ratingOk ? 'text-green-600' : 'text-gray-500'}`}>
                          {levelProgress.ratingOk ? '✅' : '⭐'}
                          評価 {rating || '—'}/{levelProgress.ratingNeeded}以上
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
                    className="flex items-center gap-2 mt-2">
                    <Award className="w-5 h-5" style={{ color: levelInfo.color }} />
                    <p className="text-sm font-bold" style={{ color: levelInfo.textColor }}>最高ランク達成！🎉</p>
                  </motion.div>
                )}
              </motion.div>

              {/* 注文管理 */}
              <div>
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" style={{ color: '#FE3B8C' }} />
                  注文管理
                </h2>
                {/* ステータスタブ */}
                <div className="flex gap-2 mb-4">
                  {dashTabs.map(t => (
                    <button key={t.id} onClick={() => setDashTab(t.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all"
                      style={dashTab === t.id ? {
                        background: 'linear-gradient(135deg, #FE3B8C, #0080FF)',
                        color: '#fff',
                      } : { background: '#fff', color: '#6B7280', border: '1.5px solid #F0F0F5' }}>
                      {t.label}
                      <span className="px-1.5 py-0.5 rounded-full text-xs"
                        style={dashTab === t.id ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: '#F5F7FA', color: '#9CA3AF' }}>
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={dashTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {currentDashOrders.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <div className="text-5xl mb-3">{dashTab === 'completed' ? '🎬' : '📬'}</div>
                        <p className="text-gray-400 text-sm">
                          {dashTab === 'pending' ? '新しいリクエストはありません' : dashTab === 'processing' ? '制作中の注文はありません' : '完了した動画はありません'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentDashOrders.map((order, i) => {
                          const st = STATUS_MAP[order.status] || STATUS_MAP.pending
                          const emoji = OCCASION_EMOJI[order.occasion] ?? '💫'
                          return (
                            <motion.div key={order.id}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{emoji}</span>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">{order.recipientName || order.occasion}</p>
                                    <p className="text-xs text-gray-400">{order.createdAt?.slice(0, 10)}</p>
                                  </div>
                                </div>
                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                  style={{ color: st.color, background: st.bg }}>
                                  {st.icon}{st.label}
                                </span>
                              </div>
                              <div className="px-5 py-4">
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{order.message}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-base font-black text-gray-900">¥{order.price?.toLocaleString()}</p>
                                  <div className="flex gap-2">
                                    {order.status === 'pending' && (
                                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => handleStatusChange(order.id, 'processing')}
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                                        style={{ background: 'linear-gradient(135deg, #0080FF, #3399FF)' }}>
                                        制作開始
                                      </motion.button>
                                    )}
                                    {order.status === 'processing' && (
                                      <Link to={`/send-video/${order.id}`}>
                                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                                          style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                                          <Upload className="w-3.5 h-3.5" />
                                          動画を送る
                                        </motion.button>
                                      </Link>
                                    )}
                                    {order.status === 'completed' && order.videoUrl && (
                                      <Link to={`/reveal/${order.id}`}>
                                        <motion.button whileHover={{ scale: 1.03 }}
                                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                                          style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
                                          動画を確認
                                        </motion.button>
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ─── 注文履歴 ─── */}
          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {orders.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl mb-5">🎬</motion.div>
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
                      <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
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
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{emoji}</span>
                            <span className="text-xs font-medium text-gray-500">{order.occasion}</span>
                            <span className="text-gray-200 mx-1">·</span>
                            <span className="text-xs text-gray-400">{order.createdAt?.slice(0, 10)}</span>
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

          {/* ─── お気に入り ─── */}
          {tab === 'wishlist' && (
            <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {favorites.length === 0 ? (
                <div className="text-center py-24">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-6xl mb-5">💜</motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">お気に入りがありません</h3>
                  <p className="text-gray-400 text-sm mb-8">気になるタレントをお気に入り登録しよう</p>
                  <Link to="/talents">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      className="btn-primary inline-flex items-center gap-2">
                      <Heart className="w-4 h-4" />タレントを探す
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((talent, i) => (
                    <motion.div key={talent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
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

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setUploadModal(null) }}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">動画をアップロード</h3>
                <button onClick={() => setUploadModal(null)} className="text-gray-300 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {!uploading && uploadProgress === 0 ? (
                <>
                  {/* モード切替 */}
                  <div className="flex gap-2 mb-5">
                    {[{ id: 'file', label: '📁 ファイル' }, { id: 'url', label: '🔗 URL入力' }].map(m => (
                      <button key={m.id} onClick={() => setUploadInputMode(m.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={uploadInputMode === m.id
                          ? { background: 'linear-gradient(135deg,#FE3B8C,#0080FF)', color: '#fff' }
                          : { background: '#F5F7FA', color: '#6B7280' }}>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {uploadInputMode === 'file' ? (
                    <label className="block border-2 border-dashed rounded-2xl p-8 text-center mb-6 cursor-pointer transition-colors"
                      style={{ borderColor: uploadFile ? '#10B981' : '#E5E7EB', background: uploadFile ? '#F0FDF4' : '#FAFAFA' }}
                      onMouseEnter={e => { if (!uploadFile) e.currentTarget.style.borderColor = '#FE3B8C' }}
                      onMouseLeave={e => { if (!uploadFile) e.currentTarget.style.borderColor = '#E5E7EB' }}>
                      <input type="file" accept="video/*" className="hidden" onChange={handleUploadFileChange} />
                      {uploadFile ? (
                        <>
                          <div className="text-3xl mb-2">🎬</div>
                          <p className="text-green-600 font-semibold text-sm">{uploadFile.name}</p>
                          <p className="text-gray-400 text-xs mt-1">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">クリックして動画を選択</p>
                          <p className="text-gray-300 text-xs mt-1">MP4, MOV 最大500MB</p>
                        </>
                      )}
                    </label>
                  ) : (
                    <div className="mb-6">
                      <input
                        type="url"
                        placeholder="https://example.com/video.mp4"
                        value={uploadUrl}
                        onChange={e => setUploadUrl(e.target.value)}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#FE3B8C] transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-2">動画ファイルの直リンクURLを入力してください</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => { setUploadModal(null); setUploadFile(null); setUploadUrl('') }}
                      className="btn-ghost flex-1 py-3 text-sm">キャンセル</button>
                    <button onClick={handleUpload}
                      disabled={uploadInputMode === 'file' ? !uploadFile : !uploadUrl.trim()}
                      className="btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                      送信する
                    </button>
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
