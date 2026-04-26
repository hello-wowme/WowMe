import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Download, Sparkles, Twitter, ArrowRight, Volume2, VolumeX } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PARTICLE_COUNT = 80
const COLORS = ['#FE3B8C', '#0080FF', '#fbbf24', '#34d399', '#a78bfa', '#f97316', '#ec4899', '#06b6d4']

function Cracker({ id }) {
  const startX = 20 + Math.random() * 60
  const angle = -60 + Math.random() * 120
  const speed = 0.6 + Math.random() * 0.8
  const vx = Math.sin((angle * Math.PI) / 180) * 55 * speed
  const vy = -(70 + Math.random() * 60) * speed
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const size = Math.random() * 10 + 5
  const isRect = Math.random() > 0.45
  const delay = Math.random() * 0.4

  return (
    <motion.div
      initial={{ left: `${startX}vw`, top: '100vh', opacity: 1, rotate: 0, scaleY: 1 }}
      animate={{
        x: [`0vw`, `${vx}vw`],
        y: [`0vh`, `${vy}vh`, `${vy * 0.2}vh`],
        opacity: [1, 1, 1, 0],
        rotate: Math.random() * 900 - 450,
        scaleY: [1, isRect ? 0.3 : 1, 1],
      }}
      transition={{
        duration: 1.4 + Math.random() * 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
        opacity: { times: [0, 0.5, 0.75, 1] },
      }}
      style={{
        position: 'fixed',
        width: isRect ? size * 0.45 : size,
        height: isRect ? size * 1.8 : size,
        background: color,
        borderRadius: isRect ? '2px' : '50%',
        pointerEvents: 'none',
        zIndex: 200,
      }}
    />
  )
}

function loadOrderFromLS(orderId) {
  try {
    const all = JSON.parse(localStorage.getItem('wowme_orders') || '[]')
    return all.find(o => o.id === orderId) || null
  } catch { return null }
}

function loadTalentFromLS(talentProfileId) {
  try {
    const all = JSON.parse(localStorage.getItem('wowme_registered_talents') || '[]')
    return all.find(t => t.id === talentProfileId || t.userId === talentProfileId?.replace('user_', '')) || null
  } catch { return null }
}

export default function VideoRevealPage() {
  const { orderId } = useParams()
  const { user } = useAuth()

  const [order, setOrder] = useState(null)
  const [talent, setTalent] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const [stage, setStage] = useState('loading')
  const [particles, setParticles] = useState([])
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef(null)

  // 注文データを取得
  useEffect(() => {
    const o = loadOrderFromLS(orderId)
    if (!o) { setNotFound(true); setStage('watching'); return }
    setOrder(o)
    const t = loadTalentFromLS(o.talentProfileId)
    setTalent(t)
    setTimeout(() => setStage('teaser'), 2500)
  }, [orderId])

  const handleReveal = () => {
    setStage('reveal')
    setParticles([...Array(PARTICLE_COUNT)].map((_, i) => i))
    setTimeout(() => { setParticles([]); setStage('watching') }, 4000)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setPlaying(!playing)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const { currentTime, duration: d } = videoRef.current
    setProgress(d ? (currentTime / d) * 100 : 0)
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = ratio * duration
  }

  const handleDownload = () => {
    if (!order?.videoUrl) return
    const a = document.createElement('a')
    a.href = order.videoUrl
    a.download = `wowme_${orderId}.mp4`
    a.click()
  }

  const fmt = (sec) => {
    if (!sec || isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const talentName = talent?.name || order?.talentName || 'タレント'
  const talentAvatar = talent?.avatar || order?.talentAvatar || ''
  const talentCategory = talent?.category || order?.talentCategory || ''

  return (
    <div className="min-h-screen flex flex-col items-center page-enter overflow-hidden"
      style={{
        background: stage === 'watching' ? '#F5F7FA' : 'linear-gradient(160deg, #fff0f6, #f0f6ff)',
        paddingTop: stage === 'watching' ? '80px' : '0',
        justifyContent: stage === 'watching' ? 'flex-start' : 'center',
      }}>

      {/* Crackers */}
      <AnimatePresence>
        {particles.map(i => <Cracker key={i} id={i} />)}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {stage === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center">
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-8xl mb-8">📦</motion.div>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-gray-500 text-xl font-medium">
              あなたへの特別なプレゼントを<br />準備しています...
            </motion.div>
            <div className="mt-8 flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  className="w-3 h-3 rounded-full"
                  style={{ background: i === 1 ? '#0080FF' : '#FE3B8C' }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Teaser */}
        {stage === 'teaser' && (
          <motion.div key="teaser"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-sm mx-auto px-4">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="relative inline-block mb-8">
              <div className="w-40 h-40 rounded-3xl flex items-center justify-center mx-auto shadow-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)', boxShadow: '0 20px 60px rgba(254,59,140,0.35)' }}>
                {talentAvatar
                  ? <img src={talentAvatar} alt={talentName} className="w-full h-full object-cover" />
                  : <Sparkles className="w-20 h-20 text-white" />}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-gray-400 text-sm mb-2">FROM</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                {talentAvatar
                  ? <img src={talentAvatar} alt={talentName} className="w-12 h-12 rounded-full object-cover border-2 shadow-md" style={{ borderColor: '#FE3B8C55' }} />
                  : <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: 'linear-gradient(135deg,#FE3B8C,#0080FF)' }}>{talentName[0]}</div>
                }
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-xl">{talentName}</p>
                  {talentCategory && <p className="text-gray-400 text-sm">{talentCategory}</p>}
                </div>
              </div>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-3xl font-black text-gray-900 mb-3">
              あなたへのメッセージが<br />届いています
            </motion.h2>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-gray-400 text-sm mb-10">タップして開封しましょう ✨</motion.p>

            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              onClick={handleReveal} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden px-14 py-6 rounded-full text-white font-bold text-xl shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)', boxShadow: '0 8px 40px rgba(254,59,140,0.4)' }}>
              <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="absolute inset-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
              開封する 🎁
            </motion.button>
          </motion.div>
        )}

        {/* Reveal Animation */}
        {stage === 'reveal' && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: [0.5, 1.5, 1], opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-8xl">🎉</motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-5xl font-black gradient-text mt-6">WOW!!</motion.h2>
          </motion.div>
        )}

        {/* Watching */}
        {stage === 'watching' && (
          <motion.div key="watching" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg mx-auto px-4 py-8">

            {notFound || !order ? (
              /* 注文が見つからない場合 */
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">動画が見つかりませんでした</h2>
                <p className="text-gray-400 text-sm mb-8">このリンクは無効か、動画がまだ届いていない可能性があります。</p>
                <Link to="/mypage">
                  <motion.button whileHover={{ scale: 1.03 }} className="btn-primary px-8 py-3">マイページへ</motion.button>
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white mb-4 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                    <Sparkles className="w-4 h-4" />
                    世界に一つだけのメッセージ
                  </motion.div>
                  <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-2xl font-black text-gray-900">{talentName}からのメッセージ</motion.h2>
                  {order.recipientName && (
                    <p className="text-gray-400 text-sm mt-1">宛先: {order.recipientName} さんへ</p>
                  )}
                </div>

                {/* Video Player */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="relative rounded-3xl overflow-hidden mb-6 shadow-2xl bg-black"
                  style={{ aspectRatio: order.videoUrl ? '9/16' : '16/9', maxHeight: '70vh' }}>

                  {order.videoUrl ? (
                    <>
                      <video
                        ref={videoRef}
                        src={order.videoUrl}
                        className="w-full h-full object-contain"
                        muted={muted}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setPlaying(false)}
                        playsInline
                      />
                      {/* Controls Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-between p-4"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 80%, rgba(0,0,0,0.2) 100%)' }}>
                        {/* Top: タレント名 */}
                        <div className="flex items-center gap-2">
                          {talentAvatar
                            ? <img src={talentAvatar} alt={talentName} className="w-8 h-8 rounded-full object-cover border border-white/40" />
                            : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#FE3B8C,#0080FF)' }}>{talentName[0]}</div>
                          }
                          <p className="text-white text-sm font-semibold drop-shadow">{talentName}</p>
                        </div>

                        {/* Center: play button */}
                        <div className="flex items-center justify-center">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={togglePlay}
                            className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                            {playing
                              ? <Pause className="w-8 h-8" style={{ color: '#FE3B8C', fill: '#FE3B8C' }} />
                              : <Play className="w-8 h-8 ml-1" style={{ color: '#FE3B8C', fill: '#FE3B8C' }} />
                            }
                          </motion.button>
                        </div>

                        {/* Bottom: シークバー + ミュート */}
                        <div>
                          {/* シークバー */}
                          <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={handleSeek}>
                            <span className="text-xs text-white/70 w-8 text-right">{fmt(videoRef.current?.currentTime)}</span>
                            <div className="flex-1 h-1.5 bg-white/30 rounded-full relative">
                              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-xs text-white/70 w-8">{fmt(duration)}</span>
                          </div>
                          {/* ミュートボタン */}
                          <div className="flex justify-end">
                            <button onClick={() => setMuted(m => !m)}
                              className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all">
                              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 動画なし */
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
                      style={{ background: 'linear-gradient(135deg, #1a0040, #2d0060)', minHeight: '200px' }}>
                      <div className="text-5xl mb-4">🎬</div>
                      <p className="text-white/70 text-sm">動画はまだ準備中です</p>
                      <p className="text-white/40 text-xs mt-2">タレントが動画を制作しています。しばらくお待ちください。</p>
                    </div>
                  )}
                </motion.div>

                {/* Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-3 mb-6">
                  {order.videoUrl && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-gray-100 text-gray-500 hover:text-[#0080FF] hover:border-blue-100 font-semibold transition-all text-sm">
                      <Download className="w-5 h-5" />
                      保存
                    </motion.button>
                  )}
                </motion.div>

                {/* Share or SNS-NG notice */}
                {order.snsPermission === 'ng' ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                    className="rounded-2xl p-5 mb-6 border border-orange-200"
                    style={{ background: '#fff7ed' }}>
                    <p className="text-sm font-bold text-orange-700 mb-1">🔒 SNS公開NG</p>
                    <p className="text-xs text-orange-600">このタレントの動画はSNSシェアが禁止されています。<br />保存して、あなただけの特別な宝物にしてください。</p>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                    className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800 mb-1">SNSでシェアしよう ✨</p>
                    <p className="text-xs text-gray-400 mb-4">あなたの感動を友達にも伝えよう</p>
                    <motion.button whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        const text = `${talentName}さんからパーソナライズ動画メッセージが届きました🎁✨\n推しへのリクエストは👇\nhttps://wowme-surprise.vercel.app/`
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm"
                      style={{ background: '#1da1f2' }}>
                      <Twitter className="w-4 h-4" />X でシェア
                    </motion.button>
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center">
                  <p className="text-gray-400 text-sm mb-4">もっと特別な体験を</p>
                  <Link to="/talents">
                    <motion.button whileHover={{ scale: 1.03 }}
                      className="inline-flex items-center gap-2 font-medium transition-colors hover:opacity-70"
                      style={{ color: '#FE3B8C' }}>
                      他のタレントを探す <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
