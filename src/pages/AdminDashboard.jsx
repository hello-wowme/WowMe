import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { CheckCircle, XCircle, Users, ShoppingBag, DollarSign, AlertTriangle, Eye, Trash2, RefreshCw } from 'lucide-react'
import { useTalents } from '../context/TalentsContext'
import LevelBadge from '../components/UI/LevelBadge'
import { fetchAllOrders, updateOrderStatus } from '../lib/db'

const OCCASION_LABEL = {
  birthday:    '🎂 誕生日',
  graduation:  '🎓 卒業・入学',
  cheering:    '📣 応援',
  anniversary: '💍 記念日',
  gift:        '🎁 プレゼント',
  just_for_me: '⭐ 自分用',
  wedding:     '💒 結婚',
  other:       '💫 その他',
}

// DB行またはlocalStorage行 → 管理画面用オブジェクトに変換
function toAdminOrder(row) {
  // localStorage形式（local_プレフィックス）
  if (row.id?.startsWith('local_')) {
    return {
      id:           row.id,
      talentName:   row.talentName ?? '—',
      talentAvatar: row.talentAvatar ?? '',
      userName:     row.recipientName || '—',
      occasion:     OCCASION_LABEL[row.occasion] ?? row.occasion ?? '—',
      price:        row.price ?? 0,
      status:       row.status === 'pending' ? 'pending_review' : row.status,
      createdAt:    row.createdAt?.slice(0, 10) ?? '',
      message:      row.message ?? '',
    }
  }
  // Supabase行
  return {
    id:           row.id,
    talentName:   row.talent_profiles?.display_name ?? '—',
    talentAvatar: '',
    userName:     row.users?.name ?? '—',
    occasion:     OCCASION_LABEL[row.occasion] ?? row.occasion ?? '—',
    price:        row.price ?? 0,
    status:       row.status === 'pending' ? 'pending_review' : row.status,
    createdAt:    row.created_at?.slice(0, 10) ?? '',
    message:      row.message ?? '',
  }
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  const loadOrders = () => {
    setLoadingOrders(true)
    fetchAllOrders().then(({ data, error }) => {
      if (!error && data) setOrders(data.map(toAdminOrder))
      setLoadingOrders(false)
    })
  }

  useEffect(() => { loadOrders() }, [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [tab, setTab] = useState('swipe')
  const [showDetail, setShowDetail] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { registeredTalents, removeTalent } = useTalents()

  const pendingOrders = orders.filter(o => o.status === 'pending_review')
  const currentOrder = pendingOrders[currentIndex]

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const approveOpacity = useTransform(x, [20, 100], [0, 1])
  const rejectOpacity = useTransform(x, [-100, -20], [1, 0])
  const controls = useAnimation()

  const handleDragEnd = async (_, info) => {
    const threshold = 80
    if (info.offset.x > threshold) {
      await controls.start({ x: 400, opacity: 0, transition: { duration: 0.3 } })
      decide('approve')
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -400, opacity: 0, transition: { duration: 0.3 } })
      decide('reject')
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
    }
  }

  const decide = async (action) => {
    if (!currentOrder) return
    const newStatus = action === 'approve' ? 'processing' : 'rejected'
    const uiStatus  = action === 'approve' ? 'processing' : 'rejected'
    setOrders(ords => ords.map(o => o.id === currentOrder.id ? { ...o, status: uiStatus } : o))
    await updateOrderStatus(currentOrder.id, newStatus).catch(console.error)
    controls.set({ x: 0, opacity: 1 })
    setCurrentIndex(i => i + 1)
    x.set(0)
  }

  const stats = [
    { label: '審査待ち', value: pendingOrders.length, icon: <AlertTriangle className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)', shadow: 'rgba(245,158,11,0.25)' },
    { label: '総注文数', value: orders.length, icon: <ShoppingBag className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #FE3B8C, #FF6BAE)', shadow: 'rgba(254,59,140,0.25)' },
    { label: '登録ユーザー', value: '1,234', icon: <Users className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #0080FF, #3399FF)', shadow: 'rgba(0,128,255,0.25)' },
    { label: '月次売上', value: '¥284,000', icon: <DollarSign className="w-5 h-5" />, gradient: 'linear-gradient(135deg, #10B981, #34D399)', shadow: 'rgba(16,185,129,0.25)' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 page-enter bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <div>
            <p className="text-gray-400 text-sm mb-1">管理者パネル</p>
            <h1 className="text-3xl font-black text-gray-900">ダッシュボード</h1>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:text-[#FE3B8C] transition-all shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
            更新
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon, gradient, shadow }, i) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                style={{ background: gradient, boxShadow: `0 4px 16px ${shadow}` }}>
                {icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[{ id: 'swipe', label: '注文審査（スワイプ）' }, { id: 'list', label: '注文一覧' }, { id: 'talents', label: `タレント管理 (${registeredTalents.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={tab === t.id ? {
                background: 'linear-gradient(135deg, #FE3B8C, #0080FF)',
                color: '#fff', boxShadow: '0 4px 16px rgba(254,59,140,0.3)'
              } : { background: '#fff', color: '#6B7280', border: '1.5px solid #F0F0F5' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Swipe UI */}
        {tab === 'swipe' && (
          <div className="flex flex-col items-center">
            <p className="text-gray-400 text-sm mb-6">
              スワイプ または ボタンで審査
              <span className="ml-2 font-medium" style={{ color: '#FE3B8C' }}>右 → 承認 / 左 → 却下</span>
            </p>

            {currentOrder ? (
              <div className="relative w-full max-w-md h-[500px] flex items-center justify-center">
                {/* Background Cards */}
                {pendingOrders.slice(currentIndex + 1, currentIndex + 3).map((_, i) => (
                  <div key={i} className="absolute bg-white rounded-3xl w-full border border-gray-100 shadow-sm"
                    style={{ height: '460px', transform: `scale(${0.95 - i * 0.03}) translateY(${(i + 1) * 12}px)`, zIndex: 2 - i }} />
                ))}

                {/* Main Card */}
                <motion.div drag="x" dragConstraints={{ left: -300, right: 300 }}
                  style={{ height: '460px', zIndex: 10, x, rotate, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
                  animate={controls} onDragEnd={handleDragEnd}
                  className="absolute bg-white rounded-3xl w-full cursor-grab active:cursor-grabbing select-none shadow-xl border border-gray-100">

                  {/* Approve Indicator */}
                  <motion.div
                    style={{ opacity: approveOpacity, color: '#10B981', borderColor: '#10B981', background: '#F0FDF4' }}
                    className="absolute top-6 left-6 flex items-center gap-2 px-5 py-2.5 rounded-full text-lg font-black border-2 rotate-[-15deg]">
                    <CheckCircle className="w-6 h-6" />APPROVE
                  </motion.div>

                  {/* Reject Indicator */}
                  <motion.div
                    style={{ opacity: rejectOpacity, color: '#EF4444', borderColor: '#EF4444', background: '#FEF2F2' }}
                    className="absolute top-6 right-6 flex items-center gap-2 px-5 py-2.5 rounded-full text-lg font-black border-2 rotate-[15deg]">
                    REJECT<XCircle className="w-6 h-6" />
                  </motion.div>

                  {/* Card Content */}
                  <div className="p-7 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-mono text-gray-300">{currentOrder.id?.slice(0,18)}…</span>
                      <span className="text-xs text-gray-300">{currentOrder.createdAt}</span>
                    </div>

                    <div className="flex-1">
                      {/* タレント情報 */}
                      <div className="flex items-center gap-3 mb-4">
                        {currentOrder.talentAvatar
                          ? <img src={currentOrder.talentAvatar} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                          : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#FE3B8C,#0080FF)' }}>
                              {currentOrder.talentName?.[0] ?? '?'}
                            </div>
                        }
                        <div>
                          <p className="text-xs text-gray-400">タレント</p>
                          <p className="text-xl font-black text-gray-900">{currentOrder.talentName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 mb-1">依頼者</p>
                          <p className="text-sm font-semibold text-gray-800">{currentOrder.userName}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 mb-1">シーン</p>
                          <p className="text-sm font-semibold text-gray-800">{currentOrder.occasion}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">メッセージ内容</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{currentOrder.message}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-gray-900">¥{currentOrder.price.toLocaleString()}</p>
                        <div className="text-right text-xs text-gray-400">
                          <p>運営: ¥{(currentOrder.price * 0.2).toLocaleString()}</p>
                          <p>タレント: ¥{(currentOrder.price * 0.8).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-center text-gray-300 mt-4">← スワイプして審査 →</p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl mb-4">✅</motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {loadingOrders ? '読み込み中...' : '審査待ちはありません'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {loadingOrders ? '' : '新しいリクエストが届いたらここに表示されます'}
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            {currentOrder && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6 mt-8">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => controls.start({ x: -400, opacity: 0, transition: { duration: 0.3 } }).then(() => decide('reject'))}
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#EF4444' }}>
                  <XCircle className="w-8 h-8" />
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetail(currentOrder)}
                  className="w-12 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all shadow-sm">
                  <Eye className="w-5 h-5" />
                </motion.button>

                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => controls.start({ x: 400, opacity: 0, transition: { duration: 0.3 } }).then(() => decide('approve'))}
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#10B981' }}>
                  <CheckCircle className="w-8 h-8" />
                </motion.button>
              </motion.div>
            )}

            {/* Progress */}
            {pendingOrders.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400 mb-2">
                  {Math.min(currentIndex, pendingOrders.length)} / {pendingOrders.length} 件審査完了
                </p>
                <div className="w-48 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                  <motion.div animate={{ width: `${Math.min(currentIndex / pendingOrders.length, 1) * 100}%` }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #FE3B8C, #0080FF)' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Talent Management */}
        {tab === 'talents' && (
          <div>
            {registeredTalents.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="text-5xl mb-4">🎤</div>
                <p className="text-gray-400">登録タレントはまだいません</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {registeredTalents.map((talent, i) => (
                  <motion.div key={talent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm">
                    {talent.avatar
                      ? <img src={talent.avatar} alt={talent.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>{talent.name?.[0]}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-900">{talent.name}</p>
                        <LevelBadge level={talent.level || 1} size="sm" />
                      </div>
                      <p className="text-xs text-gray-400">{talent.category} · ¥{talent.price?.toLocaleString()}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteTarget(talent)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-all flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                      削除
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {tab === 'list' && (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-300">{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={order.status === 'pending_review'
                        ? { background: '#FFFBEB', color: '#F59E0B' }
                        : order.status === 'approved'
                          ? { background: '#F0FDF4', color: '#10B981' }
                          : { background: '#FEF2F2', color: '#EF4444' }}>
                      {order.status === 'pending_review' ? '審査待ち' : order.status === 'approved' ? '承認済み' : '却下'}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{order.talentName} ← {order.userName}</p>
                  <p className="text-xs text-gray-400">{order.occasion} · {order.createdAt}</p>
                </div>
                <p className="text-base font-bold text-gray-900 flex-shrink-0">¥{(order.price ?? 0).toLocaleString()}</p>
                <button onClick={() => setShowDetail(order)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-700 border border-gray-100 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">

              {/* アイコン */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
                className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-8 h-8 text-red-500" />
              </motion.div>

              <h3 className="font-black text-gray-900 text-xl text-center mb-2">本当に削除しますか？</h3>

              {/* タレント情報プレビュー */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 my-5 border border-gray-100">
                {deleteTarget.avatar
                  ? <img src={deleteTarget.avatar} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                      {deleteTarget.name?.[0]}
                    </div>
                }
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{deleteTarget.name}</p>
                  <p className="text-xs text-gray-400">{deleteTarget.category} · ¥{deleteTarget.price?.toLocaleString()}</p>
                </div>
              </div>

              <p className="text-gray-500 text-sm text-center mb-6">
                このタレントをプラットフォームから完全に削除します。<br />
                <span className="font-semibold text-red-500">この操作は取り消せません。</span>
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                  キャンセル
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    await removeTalent(deleteTarget.userId)
                    setDeleteTarget(null)
                  }}
                  className="flex-1 py-3 rounded-full text-sm font-semibold text-white shadow-md transition-all"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.35)' }}>
                  削除する
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowDetail(null) }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-xl mb-6">注文詳細</h3>
              {[
                { label: '注文ID', value: showDetail.id },
                { label: 'タレント', value: showDetail.talentName },
                { label: 'ユーザー', value: showDetail.userName },
                { label: 'シーン', value: showDetail.occasion },
                { label: '金額', value: `¥${showDetail.price.toLocaleString()}` },
                { label: '申請日', value: showDetail.createdAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-gray-50">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="text-gray-800 text-sm font-medium">{value}</span>
                </div>
              ))}
              <div className="mt-4">
                <p className="text-gray-400 text-xs mb-2">メッセージ</p>
                <p className="text-sm text-gray-600 leading-relaxed">{showDetail.message}</p>
              </div>
              <button onClick={() => setShowDetail(null)} className="btn-ghost w-full mt-6 py-3 text-sm">閉じる</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
