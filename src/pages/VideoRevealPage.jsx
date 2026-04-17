import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Share2, Download, Heart, Sparkles, Twitter, ArrowRight } from 'lucide-react'
import { mockOrders, talents } from '../data/mockData'

const PARTICLE_COUNT = 60

function Particle({ delay }) {
  const x = Math.random() * 100
  const color = ['#FE3B8C', '#0080FF', '#fbbf24', '#34d399', '#a78bfa'][Math.floor(Math.random() * 5)]
  const size = Math.random() * 10 + 4
  return (
    <motion.div
      initial={{ x: `${x}vw`, y: '-5vh', opacity: 1, rotate: 0 }}
      animate={{ y: '110vh', opacity: [1, 1, 0], rotate: Math.random() * 720 - 360 }}
      transition={{ duration: Math.random() * 3 + 2, delay, ease: 'linear' }}
      style={{
        position: 'fixed', width: size, height: size * (Math.random() > 0.5 ? 0.4 : 1),
        background: color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        pointerEvents: 'none', zIndex: 100,
      }}
    />
  )
}

export default function VideoRevealPage() {
  const { orderId } = useParams()
  const order = mockOrders.find(o => o.id === orderId) || mockOrders[0]
  const talent = talents.find(t => t.id === order.talentId) || talents[0]

  const [stage, setStage] = useState('loading')
  const [particles, setParticles] = useState([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    if (stage === 'loading') setTimeout(() => setStage('teaser'), 2500)
  }, [stage])

  const handleReveal = () => {
    setStage('reveal')
    setParticles([...Array(PARTICLE_COUNT)].map((_, i) => i))
    setTimeout(() => { setParticles([]); setStage('watching') }, 4000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center page-enter overflow-hidden"
      style={{ background: stage === 'watching' ? '#F5F7FA' : 'linear-gradient(160deg, #fff0f6, #f0f6ff)' }}>
      {/* Confetti */}
      <AnimatePresence>
        {particles.map(i => <Particle key={i} delay={i * 0.02} />)}
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
              <div className="w-40 h-40 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)', boxShadow: '0 20px 60px rgba(254,59,140,0.35)' }}>
                <Sparkles className="w-20 h-20 text-white" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-gray-400 text-sm mb-2">FROM</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <img src={talent.avatar} alt={talent.name} className="w-12 h-12 rounded-full object-cover border-2 shadow-md"
                  style={{ borderColor: '#FE3B8C55' }} />
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-xl">{talent.name}</p>
                  <p className="text-gray-400 text-sm">{talent.category}</p>
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
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white mb-4 shadow-md"
                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                <Sparkles className="w-4 h-4" />
                世界に一つだけのメッセージ
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-2xl font-black text-gray-900">{talent.name}からのメッセージ</motion.h2>
            </div>

            {/* Video Player */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden mb-6 aspect-[9/16] sm:aspect-video shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #1a0040, #2d0060)' }}>
              <img src={talent.avatar} alt={talent.name} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl mb-4">
                  <Play className="w-10 h-10 ml-2" style={{ color: '#FE3B8C', fill: '#FE3B8C' }} />
                </motion.button>
                <p className="text-white/80 text-sm">タップして再生</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-white/60">0:00</span>
                  <div className="flex-1 h-1 bg-white/20 rounded-full">
                    <div className="w-0 h-full bg-white rounded-full" />
                  </div>
                  <span className="text-xs text-white/60">0:45</span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-3 mb-6">
              <motion.button onClick={() => { if (!liked) { setLiked(true); setLikeCount(c => c + 1) } }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold border-2 transition-all"
                style={liked ? { background: '#fff0f6', borderColor: '#FE3B8C44', color: '#FE3B8C' } : { background: '#fff', borderColor: '#F0F0F5', color: '#9CA3AF' }}>
                <motion.div animate={liked ? { scale: [1, 1.5, 1] } : {}}>
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                </motion.div>
                {liked ? likeCount : '保存'}
              </motion.button>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-gray-100 text-gray-500 hover:text-[#0080FF] hover:border-blue-100 font-semibold transition-all">
                <Download className="w-5 h-5" />
                保存
              </motion.button>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-gray-100 text-gray-500 hover:text-[#FE3B8C] hover:border-pink-100 font-semibold transition-all">
                <Share2 className="w-5 h-5" />
                シェア
              </motion.button>
            </motion.div>

            {/* Share */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-800 mb-1">SNSでシェアしよう ✨</p>
              <p className="text-xs text-gray-400 mb-4">あなたの感動を友達にも伝えよう</p>
              <motion.button whileHover={{ scale: 1.05 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm"
                style={{ background: '#1da1f2' }}>
                <Twitter className="w-4 h-4" />X でシェア
              </motion.button>
            </motion.div>

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
