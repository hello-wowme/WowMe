import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, Zap, Heart, Share2, Play, ChevronLeft, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { talents } from '../data/mockData'
import LevelBadge from '../components/UI/LevelBadge'
import { getLevelInfo, calcRevenueShare } from '../utils/talentLevel'
import { useFavorites } from '../context/FavoritesContext'
import { useTalents } from '../context/TalentsContext'

export default function TalentDetailPage() {
  const { id } = useParams()
  const { registeredTalents } = useTalents()
  const allTalents = [...registeredTalents, ...talents]
  const talent = allTalents.find(t => t.id === id) || talents[0]
  const level = talent.level || 1
  const levelInfo = getLevelInfo(level)
  const { talentAmount, platformAmount } = calcRevenueShare(talent.price, level)
  const { toggleFavorite, isFavorite } = useFavorites()
  const favorited = isFavorite(talent.id)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleFavorite = () => {
    toggleFavorite(talent)
    setToastMsg(favorited ? 'お気に入りから削除しました' : '❤️ お気に入りに追加しました')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div className="min-h-screen pt-16 page-enter bg-[#F5F7FA]">
      {/* Cover */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img src={talent.cover} alt={talent.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F5F7FA]" />
        <Link to="/talents"
          className="absolute top-24 left-4 sm:left-8 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-600 hover:text-gray-900 transition-colors shadow-sm border border-white/50">
          <ChevronLeft className="w-4 h-4" />
          戻る
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-5">
              <div className="relative flex-shrink-0">
                <img src={talent.avatar} alt={talent.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl" />
                {talent.available && (
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    受付中
                  </div>
                )}
              </div>
              <div className="flex-1 pt-8 sm:pt-12">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{talent.name}</h1>
                    <p className="text-gray-400 text-sm">{talent.handle}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                        {talent.category}
                      </span>
                      <LevelBadge level={level} size="sm" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <motion.button
                      onClick={handleFavorite}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
                      className="p-2.5 rounded-xl border transition-all shadow-sm"
                      style={favorited
                        ? { background: '#fff0f6', borderColor: '#FE3B8C44', color: '#FE3B8C' }
                        : { background: '#fff', borderColor: '#F0F0F5', color: '#9CA3AF' }}>
                      <motion.div animate={favorited ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
                        <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                      </motion.div>
                    </motion.button>
                    <button className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-[#0080FF] border border-gray-100 transition-colors shadow-sm">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4">
              {[
                { icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />, value: talent.rating, label: `${talent.reviewCount}件のレビュー` },
                { icon: <Clock className="w-5 h-5 text-[#0080FF]" />, value: talent.responseTime, label: '返答時間' },
                { icon: <Zap className="w-5 h-5 text-green-500" />, value: `${talent.completionRate}%`, label: '完了率' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                  <div className="flex justify-center mb-2">{icon}</div>
                  <p className="font-bold text-gray-900 text-lg">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </motion.div>

            {/* Bio */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3">プロフィール</h2>
              <p className="text-gray-500 leading-relaxed">{talent.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {talent.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs text-gray-500 bg-gray-50 border border-gray-100">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Sample Videos */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-bold text-gray-900 mb-4">サンプル動画</h2>
              <div className="grid grid-cols-2 gap-4">
                {talent.sampleVideos.map((video, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03 }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-video shadow-md">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <motion.div whileHover={{ scale: 1.2 }}
                        className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border-2 border-white/60">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </motion.div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70">
                      <p className="text-xs text-white font-medium">{video.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">レビュー</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-gray-900 text-lg">{talent.rating}</span>
                  <span className="text-gray-400 text-sm">({talent.reviewCount})</span>
                </div>
              </div>
              <div className="space-y-4">
                {talent.reviews.map((review, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 text-sm">{review.user}</p>
                          <p className="text-xs text-gray-300">{review.date}</p>
                        </div>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{review.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sticky Order Card */}
          <div className="md:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="sticky top-28">
              <div className="bg-white rounded-3xl p-7 space-y-6 border border-gray-100 shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-400 text-sm">リクエスト料金</p>
                    <LevelBadge level={level} size="sm" />
                  </div>
                  <p className="text-4xl font-black text-gray-900">
                    ¥{talent.price.toLocaleString()}
                    <span className="text-lg text-gray-400 font-normal ml-1">〜</span>
                  </p>
                  {/* 料金内訳 */}
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="mt-3 rounded-2xl p-3 space-y-1.5 text-xs"
                    style={{ background: levelInfo.bgColor, border: `1.5px solid ${levelInfo.borderColor}` }}>
                    <p className="font-semibold mb-2" style={{ color: levelInfo.textColor }}>
                      <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                      料金の内訳
                    </p>
                    <div className="flex justify-between">
                      <span className="text-gray-500">タレントへ（{Math.round(levelInfo.talentShare * 100)}%）</span>
                      <span className="font-bold text-gray-800">¥{talentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">運営へ（{Math.round(levelInfo.platformShare * 100)}%）</span>
                      <span className="text-gray-500">¥{platformAmount.toLocaleString()}</span>
                    </div>
                    {/* 比率バー */}
                    <div className="flex h-1.5 rounded-full overflow-hidden mt-2 gap-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.talentShare * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                        className="rounded-l-full"
                        style={{ background: levelInfo.gradient }}
                      />
                      <div className="flex-1 bg-gray-200 rounded-r-full" />
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-3">
                  {[
                    `${talent.responseTime}以内に返信`,
                    'パーソナライズ動画',
                    '永久保存・シェア可能',
                    `完了率 ${talent.completionRate}%`,
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                {talent.available ? (
                  <Link to={`/request/${talent.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-primary w-full flex items-center justify-center gap-3 text-base"
                    >
                      リクエストする
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                ) : (
                  <button disabled className="w-full py-4 rounded-full text-gray-400 bg-gray-100 font-semibold cursor-not-allowed">
                    受付停止中
                  </button>
                )}

                <p className="text-xs text-center text-gray-300">完成しない場合は全額返金保証</p>
              </div>

              <div className="bg-white rounded-2xl p-5 mt-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <img src={talent.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <p className="text-sm font-medium text-gray-700">{talent.name}より</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  一つ一つのリクエストに全力で取り組んでいます。あなただけの特別なメッセージをお届けします！
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-xl"
            style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
