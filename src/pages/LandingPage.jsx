import { useState, useEffect, useRef } from 'react'
import TermsModal from '../components/UI/TermsModal'
import PrivacyModal from '../components/UI/PrivacyModal'
import wowmeLogo from '../components/Layout/WowMe_Logo.svg'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Star, Play, ArrowRight, Heart, Sparkles, Gift, Zap, ChevronDown } from 'lucide-react'
import { talents } from '../data/mockData'
import TalentCard from '../components/UI/TalentCard'

const HERO_WORDS = ['感動', 'ワクワク', '特別', '奇跡', '動画']

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % HERO_WORDS.length), 2200)
    return () => clearInterval(interval)
  }, [])

  const featuredTalents = talents.filter(t => t.featured)

  return (
    <>
    <div className="overflow-hidden bg-white">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #fff0f6 0%, #f0f6ff 55%, #f5f7fa 100%)' }}>
        {/* Background Orbs */}
        <div className="orb w-[600px] h-[600px] top-[-100px] left-[-200px]" style={{ background: 'rgba(254,59,140,0.12)' }} />
        <div className="orb w-[500px] h-[500px] top-[200px] right-[-100px]" style={{ background: 'rgba(0,128,255,0.10)' }} />
        <div className="orb w-[300px] h-[300px] bottom-[100px] left-[300px]" style={{ background: 'rgba(254,59,140,0.07)' }} />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(#FE3B8C 1px, transparent 1px), linear-gradient(90deg, #FE3B8C 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white border border-pink-100 shadow-sm px-4 py-2 rounded-full text-sm font-medium text-gray-500 mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#FE3B8C]" />
            世界に一つだけの体験
            <Sparkles className="w-4 h-4 text-[#0080FF]" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl font-black leading-none mb-6"
          >
            <span className="block text-gray-900">推しからの</span>
            <span className="block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 30, rotateX: -30 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -30, rotateX: 30 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block gradient-text text-shadow-glow"
                >
                  {HERO_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="block text-gray-900">を、あなたへ。</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            タレント・インフルエンサー・クリエイターから、<br className="hidden sm:block" />
            あなただけのパーソナライズ動画メッセージを受け取ろう
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/talents">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 8px 50px rgba(254,59,140,0.5)' }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary flex items-center gap-3 text-lg px-10 py-5"
              >
                <Sparkles className="w-5 h-5" />
                タレントを探す
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost flex items-center gap-3 text-lg"
            >
              <Play className="w-5 h-5 text-[#0080FF]" />
              デモを見る
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-8 sm:gap-16 mt-20"
          >
            {[
              { value: '10,000+', label: '動画配信数' },
              { value: '500+', label: 'タレント' },
              { value: '4.97', label: '平均評価', icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> },
            ].map(({ value, label, icon }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1 text-3xl font-black text-gray-900 mb-1">
                  {icon}
                  {value}
                </div>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Talent Avatars */}
        {talents.slice(0, 4).map((t, i) => {
          const positions = [
            { top: '15%', left: '5%' },
            { top: '25%', right: '5%' },
            { bottom: '25%', left: '3%' },
            { bottom: '15%', right: '3%' },
          ]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
              style={{
                position: 'absolute',
                ...positions[i],
                animation: `float ${5 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
              className="hidden lg:block"
            >
              <div className="bg-white shadow-xl border border-gray-100 p-2.5 rounded-2xl">
                <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-xl object-cover" />
                <p className="text-xs text-center mt-1.5 text-gray-500 font-medium">¥{(t.price / 1000).toFixed(0)}k~</p>
              </div>
            </motion.div>
          )
        })}

      </section>

      {/* How it Works */}
      <section className="py-32 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: '#FE3B8C' }}>How it works</span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              たった<span className="gradient-text">3ステップ</span>で
            </h2>
            <p className="text-gray-400 text-lg">推しからの特別なメッセージが届く</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(254,59,140,0.2), transparent)' }} />

            {[
              {
                step: '01',
                icon: <Star className="w-8 h-8" />,
                title: '推しを選ぶ',
                desc: '500人以上のタレントから、あなたの推しを見つけよう',
                gradient: 'linear-gradient(135deg, #FE3B8C, #FF6BAE)',
                shadow: 'rgba(254,59,140,0.3)',
              },
              {
                step: '02',
                icon: <Heart className="w-8 h-8" />,
                title: 'リクエスト送信',
                desc: '用途・名前・メッセージを入力するだけ。最短30秒で完了',
                gradient: 'linear-gradient(135deg, #0080FF, #3399FF)',
                shadow: 'rgba(0,128,255,0.3)',
              },
              {
                step: '03',
                icon: <Gift className="w-8 h-8" />,
                title: '動画を受け取る',
                desc: '世界に一つだけの動画が届いたら、感動の瞬間を楽しもう',
                gradient: 'linear-gradient(135deg, #FE3B8C, #0080FF)',
                shadow: 'rgba(254,59,140,0.25)',
              },
            ].map(({ step, icon, title, desc, gradient, shadow }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-3xl p-8 h-full border border-gray-100"
                  style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.07)' }}
                >
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg"
                    style={{ background: gradient, boxShadow: `0 8px 24px ${shadow}` }}>
                    {icon}
                  </div>
                  <div className="text-6xl font-black text-gray-50 absolute top-4 right-6">{step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-400 leading-relaxed">{desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Talents */}
      <section className="py-20 px-4" style={{ background: '#F5F7FA' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: '#0080FF' }}>Featured</span>
              <h2 className="text-4xl font-black text-gray-900">
                注目の<span className="gradient-text-pink">タレント</span>
              </h2>
            </div>
            <Link to="/talents" className="flex items-center gap-2 font-medium transition-colors hover:opacity-70" style={{ color: '#FE3B8C' }}>
              すべて見る <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTalents.map((talent, i) => (
              <TalentCard key={talent.id} talent={talent} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: '#FE3B8C' }}>Voices</span>
            <h2 className="text-4xl font-black text-gray-900">
              みんなの<span className="gradient-text">感動</span>の声
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: '誕生日に葉月りのさんのメッセージを贈ったら、友人が号泣してました。こんな体験は他じゃ絶対に買えない。',
                user: 'Yuki, 27歳',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
                rating: 5,
              },
              {
                text: '遠距離の彼女に送ったら「えっ、本物！？」って大興奮で電話が来ました笑　最高のサプライズになりました。',
                user: 'Haruto, 24歳',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
                rating: 5,
              },
              {
                text: '推しに名前を呼んでもらった瞬間、現実とは思えなかった。WowMeのおかげで夢が叶いました！',
                user: 'Saki, 22歳',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
                rating: 5,
              },
            ].map(({ text, user, avatar, rating }, i) => (
              <motion.div
                key={user}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-7 border border-gray-100"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">"&thinsp;{text}&thinsp;"</p>
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={user} className="w-10 h-10 rounded-full object-cover" />
                  <span className="text-sm font-medium text-gray-500">{user}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4" style={{ background: '#F5F7FA' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 sm:p-20 text-center"
            style={{ background: 'linear-gradient(135deg, #FE3B8C 0%, #CC1A6E 40%, #0055CC 100%)' }}
          >
            <div className="orb w-[300px] h-[300px] -top-10 -left-10" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="orb w-[200px] h-[200px] -bottom-5 -right-5" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-6xl mb-6"
              >
                ⭐
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                あなたの推しは<br />
                ここにいる
              </h2>
              <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">
                今すぐタレントを探して、世界で一つだけの体験を手に入れよう。
              </p>
              <Link to="/talents">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white font-bold text-lg px-12 py-5 rounded-full inline-flex items-center gap-3 transition-all"
                  style={{ color: '#FE3B8C' }}
                >
                  <Zap className="w-5 h-5" />
                  今すぐ始める
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <img src={wowmeLogo} alt="WowMe" className="h-7 w-auto object-contain" />
          </div>
          <p className="text-gray-400 text-sm">© 2026 WowMe. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <button onClick={() => setShowTerms(true)} className="hover:text-gray-600 transition-colors">利用規約</button>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-gray-600 transition-colors">プライバシー</button>
            <a href="#" className="hover:text-gray-600 transition-colors">お問い合わせ</a>
          </div>
        </div>
      </footer>
    </div>
    {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  )
}
