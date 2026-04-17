/**
 * WowMe タレント レベル制度
 * Lv1〜Lv5 のレベル定義・レベニューシェア・レベルアップ条件
 */

export const LEVELS = {
  1: {
    level: 1,
    label: '新人',
    emoji: '🌱',
    talentShare: 0.60,
    platformShare: 0.40,
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
    bgColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    textColor: '#374151',
    glowColor: 'rgba(107,114,128,0.25)',
    nextCondition: { orders: 10, rating: null },
    description: 'WowMeに参加したばかりのタレント',
  },
  2: {
    level: 2,
    label: '成長中',
    emoji: '🌿',
    talentShare: 0.65,
    platformShare: 0.35,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #34D399, #10B981)',
    bgColor: '#F0FDF4',
    borderColor: '#6EE7B7',
    textColor: '#065F46',
    glowColor: 'rgba(16,185,129,0.25)',
    nextCondition: { orders: 30, rating: 4.0 },
    description: '着実に実績を積み上げているタレント',
  },
  3: {
    level: 3,
    label: '人気',
    emoji: '⭐',
    talentShare: 0.70,
    platformShare: 0.30,
    color: '#0080FF',
    gradient: 'linear-gradient(135deg, #3399FF, #0080FF)',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    textColor: '#1E40AF',
    glowColor: 'rgba(0,128,255,0.25)',
    nextCondition: { orders: 80, rating: 4.3 },
    description: 'ファンから高い支持を得ている人気タレント',
  },
  4: {
    level: 4,
    label: 'トップ',
    emoji: '💎',
    talentShare: 0.75,
    platformShare: 0.25,
    color: '#FE3B8C',
    gradient: 'linear-gradient(135deg, #FF6BAE, #FE3B8C)',
    bgColor: '#FFF0F6',
    borderColor: '#FBCFE8',
    textColor: '#9D174D',
    glowColor: 'rgba(254,59,140,0.25)',
    nextCondition: { orders: 200, rating: 4.5 },
    description: 'WowMeを代表するトップタレント',
  },
  5: {
    level: 5,
    label: 'レジェンド',
    emoji: '👑',
    talentShare: 0.80,
    platformShare: 0.20,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
    textColor: '#92400E',
    glowColor: 'rgba(245,158,11,0.35)',
    nextCondition: null,
    description: '伝説のタレント。WowMeの顔',
  },
}

/**
 * 累計注文数と評価から適切なレベルを計算する
 */
export function calcLevel(totalOrders, rating) {
  if (totalOrders >= 200 && rating >= 4.5) return 5
  if (totalOrders >= 80  && rating >= 4.3) return 4
  if (totalOrders >= 30  && rating >= 4.0) return 3
  if (totalOrders >= 10)                   return 2
  return 1
}

/**
 * レベル情報を取得する
 */
export function getLevelInfo(level) {
  return LEVELS[Math.min(Math.max(level, 1), 5)]
}

/**
 * 料金の内訳を計算する
 */
export function calcRevenueShare(price, level) {
  const info = getLevelInfo(level)
  const talentAmount = Math.round(price * info.talentShare)
  const platformAmount = price - talentAmount
  return { talentAmount, platformAmount, talentShare: info.talentShare, platformShare: info.platformShare }
}

/**
 * 次レベルまでの進捗情報
 */
export function getLevelProgress(level, totalOrders, rating) {
  const info = getLevelInfo(level)
  if (!info.nextCondition) return null // Lv5はMAX

  const next = info.nextCondition
  const orderProgress = Math.min(totalOrders / next.orders, 1)
  const orderRemaining = Math.max(next.orders - totalOrders, 0)
  const ratingOk = next.rating ? rating >= next.rating : true

  return {
    nextLevel: level + 1,
    nextLevelInfo: getLevelInfo(level + 1),
    orderProgress,
    orderRemaining,
    ordersNeeded: next.orders,
    ratingNeeded: next.rating,
    ratingOk,
    ratingCurrent: rating,
  }
}
