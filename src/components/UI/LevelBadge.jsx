import { motion } from 'framer-motion'
import { getLevelInfo } from '../../utils/talentLevel'

/**
 * タレントレベルバッジ
 * size: 'sm' | 'md' | 'lg'
 * animated: Lv5のとき輝きアニメーション
 */
export default function LevelBadge({ level = 1, size = 'md', animated = true, className = '' }) {
  const info = getLevelInfo(level)
  const isLegend = level === 5

  const sizes = {
    sm: { badge: 'px-2 py-0.5 text-xs gap-1', emoji: 'text-xs' },
    md: { badge: 'px-3 py-1 text-xs gap-1.5', emoji: 'text-sm' },
    lg: { badge: 'px-4 py-2 text-sm gap-2', emoji: 'text-base' },
  }

  const s = sizes[size] || sizes.md

  return (
    <motion.span
      className={`relative inline-flex items-center rounded-full font-bold border overflow-hidden ${s.badge} ${className}`}
      style={{
        background: info.bgColor,
        borderColor: info.borderColor,
        color: info.textColor,
        boxShadow: animated ? `0 2px 12px ${info.glowColor}` : 'none',
      }}
      whileHover={animated ? { scale: 1.06 } : {}}
    >
      {/* Legend shimmer */}
      {isLegend && animated && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'linear', repeatDelay: 1.5 }}
        />
      )}
      <span className={s.emoji}>{info.emoji}</span>
      <span>Lv{level} {info.label}</span>
    </motion.span>
  )
}
