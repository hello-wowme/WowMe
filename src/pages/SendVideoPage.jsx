/**
 * SendVideoPage — タレントが特定のファンへ動画を送るページ
 * URL: /send-video  または /send-video/:orderId
 */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Send, CheckCircle, ChevronLeft, Video,
  User, MessageSquare, Gift, Link as LinkIcon, FileVideo,
  Sparkles, Clock, X, Play,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchOrdersByTalentUserId, updateOrderStatus, uploadVideo, dbOrderToApp } from '../lib/db'
import { useNotifications } from '../context/NotificationsContext'

const OCCASION_LABEL = {
  birthday:    '🎂 誕生日',
  graduation:  '🎓 卒業・進学',
  cheering:    '📣 応援メッセージ',
  anniversary: '💍 記念日',
  gift:        '🎁 プレゼント',
  just_for_me: '⭐ 自分用',
  wedding:     '💒 結婚祝い',
  other:       '💫 その他',
}

export default function SendVideoPage() {
  const { orderId: paramOrderId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { refresh: refreshNotifications } = useNotifications()

  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  // アップロード関連
  const [inputMode, setInputMode] = useState('file')  // 'file' | 'url'
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef(null)
  const videoPreviewRef = useRef(null)

  // 制作中の注文を取得
  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    fetchOrdersByTalentUserId(user.id).then(({ data }) => {
      const processing = (data || []).map(dbOrderToApp).filter(o => o.status === 'processing')
      setOrders(processing)
      // URLにorderIdがあれば自動選択
      if (paramOrderId) {
        const found = processing.find(o => o.id === paramOrderId)
        if (found) setSelectedOrder(found)
      }
      setLoading(false)
    })
  }, [user?.id, paramOrderId])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('video/')) return
    setVideoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSend = async () => {
    if (!selectedOrder) return

    let finalUrl = ''
    if (inputMode === 'url') {
      if (!videoUrl.trim()) return
      finalUrl = videoUrl.trim()
    } else {
      if (!videoFile) return
    }

    setUploading(true)
    setProgress(0)

    if (inputMode === 'file' && videoFile) {
      // Supabase Storage があればアップロード
      const { url, error } = await uploadVideo(selectedOrder.id, videoFile)
      if (!error && url) {
        finalUrl = url
        setProgress(100)
      } else {
        // localStorage モード: ObjectURL（同セッション内有効）
        finalUrl = previewUrl || URL.createObjectURL(videoFile)
        // プログレスアニメ
        for (let i = 0; i <= 100; i += 8) {
          await new Promise(r => setTimeout(r, 60))
          setProgress(i)
        }
        setProgress(100)
      }
    } else {
      // URL モードはアニメのみ
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 80))
        setProgress(i)
      }
    }

    // 注文ステータスを completed に更新
    await updateOrderStatus(selectedOrder.id, 'completed', finalUrl)

    // ローカルステートも更新
    setOrders(prev => prev.filter(o => o.id !== selectedOrder.id))
    refreshNotifications?.()

    setUploading(false)
    setDone(true)
  }

  const reset = () => {
    setSelectedOrder(null)
    setVideoFile(null)
    setVideoUrl('')
    setPreviewUrl('')
    setProgress(0)
    setDone(false)
    setInputMode('file')
  }

  if (!user?.talentProfile?.setupComplete) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-gray-500 text-sm mb-4">タレント登録が必要です</p>
          <Link to="/talent-setup" className="btn-primary px-6 py-3 text-sm">プロフィール設定へ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#F5F7FA]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* ヘッダー */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/mypage" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            マイページに戻る
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">動画を送る</h1>
              <p className="text-gray-400 text-sm">ファンへパーソナライズ動画を届けよう</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* 完了画面 */}
          {done && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                <CheckCircle className="w-20 h-20 mx-auto mb-5" style={{ color: '#10B981' }} />
              </motion.div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">送信完了！🎉</h2>
              <p className="text-gray-400 text-sm mb-8">
                {selectedOrder?.recipientName
                  ? `${selectedOrder.recipientName}さんへ動画が届きました`
                  : 'ファンへ動画が届きました'}
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={reset}
                  className="px-6 py-3 rounded-2xl text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:border-[#FE3B8C] hover:text-[#FE3B8C] transition-all">
                  別の動画を送る
                </button>
                <Link to="/mypage">
                  <button className="btn-primary px-6 py-3 text-sm">ダッシュボードへ</button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* ローディング */}
          {!done && loading && (
            <motion.div key="loading" className="text-center py-20">
              <div className="flex justify-center gap-2">
                {[0,1,2].map(i => (
                  <motion.div key={i}
                    animate={{ scale: [1,1.5,1], opacity: [0.3,1,0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    className="w-3 h-3 rounded-full"
                    style={{ background: i === 1 ? '#0080FF' : '#FE3B8C' }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* 注文選択 */}
          {!done && !loading && !selectedOrder && (
            <motion.div key="select"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">制作中の注文はありません</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    審査待ちの注文を「制作開始」にすると<br />こちらで動画を送れるようになります
                  </p>
                  <Link to="/mypage">
                    <button className="btn-primary px-6 py-3 text-sm">ダッシュボードへ</button>
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">動画を送るリクエストを選択してください</p>
                  <div className="space-y-4">
                    {orders.map((order, i) => (
                      <motion.button
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden hover:border-[#FE3B8C] hover:shadow-md transition-all">

                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                              style={{ background: 'linear-gradient(135deg, #fff0f6, #f0f6ff)' }}>
                              {OCCASION_LABEL[order.occasion]?.split(' ')[0] ?? '💫'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {order.recipientName
                                  ? `${order.recipientName}さんへ`
                                  : OCCASION_LABEL[order.occasion] ?? order.occasion}
                              </p>
                              <p className="text-xs text-gray-400">{order.createdAt?.slice(0, 10)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-gray-900">¥{order.price?.toLocaleString()}</span>
                            <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                          </div>
                        </div>

                        <div className="px-5 py-3">
                          <p className="text-xs text-gray-500 line-clamp-2">{order.message}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* 動画アップロード画面 */}
          {!done && !loading && selectedOrder && !uploading && progress === 0 && (
            <motion.div key="upload"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">

              {/* リクエスト詳細カード */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: 'linear-gradient(135deg, #fff0f6, #f0f6ff)' }}>
                      {OCCASION_LABEL[selectedOrder.occasion]?.split(' ')[0] ?? '💫'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {OCCASION_LABEL[selectedOrder.occasion] ?? selectedOrder.occasion}
                      </p>
                      <p className="text-xs text-gray-400">{selectedOrder.createdAt?.slice(0, 10)}</p>
                    </div>
                  </div>
                  <button onClick={reset}
                    className="p-1.5 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {selectedOrder.recipientName && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <User className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <span className="text-gray-500">宛先:</span>
                      <span className="font-semibold text-gray-800">{selectedOrder.recipientName}さん</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-sm">
                    <MessageSquare className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600 leading-relaxed">{selectedOrder.message}</p>
                  </div>
                  {selectedOrder.isGift && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Gift className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <span className="text-[#FE3B8C] font-medium">🎁 サプライズプレゼントです</span>
                    </div>
                  )}
                </div>
              </div>

              {/* アップロードエリア */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5" style={{ color: '#FE3B8C' }} />
                  動画を追加
                </h3>

                {/* モード切替 */}
                <div className="flex gap-2 mb-5">
                  {[
                    { id: 'file', icon: <FileVideo className="w-3.5 h-3.5" />, label: 'ファイル' },
                    { id: 'url',  icon: <LinkIcon className="w-3.5 h-3.5" />,    label: 'URL入力' },
                  ].map(m => (
                    <button key={m.id} onClick={() => { setInputMode(m.id); setVideoFile(null); setPreviewUrl(''); setVideoUrl('') }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={inputMode === m.id
                        ? { background: 'linear-gradient(135deg,#FE3B8C,#0080FF)', color: '#fff' }
                        : { background: '#F5F7FA', color: '#6B7280' }}>
                      {m.icon}{m.label}
                    </button>
                  ))}
                </div>

                {inputMode === 'file' ? (
                  <>
                    {/* ドラッグ&ドロップ / クリック */}
                    <div
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4"
                      style={{
                        borderColor: videoFile ? '#10B981' : '#E5E7EB',
                        background:  videoFile ? '#F0FDF4' : '#FAFAFA',
                      }}
                      onMouseEnter={e => { if (!videoFile) e.currentTarget.style.borderColor = '#FE3B8C' }}
                      onMouseLeave={e => { if (!videoFile) e.currentTarget.style.borderColor = '#E5E7EB' }}>
                      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                      {videoFile ? (
                        <>
                          <div className="text-4xl mb-2">🎬</div>
                          <p className="font-semibold text-green-700 text-sm">{videoFile.name}</p>
                          <p className="text-gray-400 text-xs mt-1">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm font-medium">クリックまたはドラッグ&ドロップ</p>
                          <p className="text-gray-300 text-xs mt-1">MP4, MOV, AVI 最大500MB</p>
                        </>
                      )}
                    </div>

                    {/* プレビュー */}
                    {previewUrl && (
                      <div className="rounded-2xl overflow-hidden bg-black mb-4 relative" style={{ aspectRatio: '9/16', maxHeight: '300px' }}>
                        <video ref={videoPreviewRef} src={previewUrl} controls className="w-full h-full object-contain" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mb-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type="url"
                        placeholder="https://example.com/video.mp4"
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#FE3B8C] transition-colors"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">動画ファイルの直リンクURLを入力してください</p>
                    {videoUrl && (
                      <div className="mt-3 rounded-2xl overflow-hidden bg-black relative" style={{ aspectRatio: '16/9' }}>
                        <video src={videoUrl} controls className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                )}

                {/* 送信ボタン */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={inputMode === 'file' ? !videoFile : !videoUrl.trim()}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)', boxShadow: '0 4px 20px rgba(254,59,140,0.35)' }}>
                  <Send className="w-5 h-5" />
                  ファンに動画を送る 🎁
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* アップロード中 */}
          {!done && (uploading || (progress > 0 && progress < 100)) && (
            <motion.div key="uploading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-[#FE3B8C] mx-auto mb-6" />
              <p className="text-gray-800 font-semibold mb-2">動画を送信中...</p>
              <p className="text-gray-400 text-xs mb-6">しばらくお待ちください</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mx-auto max-w-xs">
                <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FE3B8C, #0080FF)' }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">{progress}%</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
