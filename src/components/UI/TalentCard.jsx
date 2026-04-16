import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, Clock, Zap } from 'lucide-react'

export default function TalentCard({ talent, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/talent/${talent.id}`} className="talent-card block group">
        {/* Cover Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={talent.cover}
            alt={talent.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

          {/* Status Badge */}
          {!talent.available && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
              受付停止中
            </div>
          )}
          {talent.featured && talent.available && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}
            >
              人気
            </motion.div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative px-5">
          <div className="absolute -top-8 left-5">
            <div className="relative">
              <img
                src={talent.avatar}
                alt={talent.name}
                className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-lg"
                style={{ borderWidth: 3, borderColor: '#fff' }}
              />
              {talent.available && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-10 pb-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{talent.name}</h3>
              <p className="text-xs text-gray-400">{talent.handle}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">¥{talent.price.toLocaleString()}</p>
              <p className="text-xs text-gray-400">〜</p>
            </div>
          </div>

          <p className="text-xs font-semibold mb-3" style={{ color: '#FE3B8C' }}>{talent.category}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {talent.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs text-gray-500 bg-gray-50 border border-gray-100">
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-gray-800">{talent.rating}</span>
              <span className="text-xs text-gray-400">({talent.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{talent.responseTime}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Zap className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-500 font-medium">{talent.completionRate}%</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
