import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchOrdersByUser, fetchOrdersByTalentUserId, dbOrderToApp } from '../lib/db'
import { useAuth } from './AuthContext'

const NotificationsContext = createContext(null)

const LS_READ_KEY = 'wowme_read_notifications'

function loadRead() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_READ_KEY) || '[]')) } catch { return new Set() }
}
function saveRead(set) {
  localStorage.setItem(LS_READ_KEY, JSON.stringify([...set]))
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [readIds, setReadIds] = useState(loadRead)

  const buildNotifications = useCallback(async () => {
    if (!user?.id) { setNotifications([]); return }

    const isTalent = !!user?.talentProfile?.setupComplete
    const items = []

    if (isTalent) {
      // タレント向け：審査待ち・制作中のリクエスト
      const { data: orders } = await fetchOrdersByTalentUserId(user.id)
      if (orders) {
        orders.map(dbOrderToApp).forEach(o => {
          if (o.status === 'pending') {
            items.push({
              id: `req_${o.id}`,
              type: 'request',
              emoji: '📩',
              title: '新しいリクエストが届きました',
              body: `「${o.occasion}」のリクエストです`,
              time: o.createdAt,
            })
          } else if (o.status === 'processing') {
            items.push({
              id: `proc_${o.id}`,
              type: 'processing',
              emoji: '🎬',
              title: '制作中のリクエストがあります',
              body: `期限内に動画を完成させましょう`,
              time: o.createdAt,
            })
          } else if (o.status === 'video_review') {
            items.push({
              id: `vrev_${o.id}`,
              type: 'video_review',
              emoji: '🔍',
              title: '動画が審査中です',
              body: `管理者が確認しています。しばらくお待ちください`,
              time: o.createdAt,
            })
          }
        })
      }
    } else {

      // ファン向け：動画完了・審査待ち
      const { data: orders } = await fetchOrdersByUser(user.id)
      if (orders) {
        orders.map(dbOrderToApp).forEach(o => {
          if (o.status === 'completed') {
            items.push({
              id: `video_${o.id}`,
              type: 'video',
              emoji: '🎁',
              title: '動画が届きました！',
              body: `${o.talentName || 'タレント'}からのメッセージを受け取ろう`,
              time: o.completedAt || o.createdAt,
              link: `/reveal/${o.id}`,
            })
          } else if (o.status === 'processing') {
            items.push({
              id: `making_${o.id}`,
              type: 'making',
              emoji: '✨',
              title: '動画を制作中です',
              body: `${o.talentName || 'タレント'}が制作しています。もうすぐ届きます！`,
              time: o.createdAt,
            })
          } else if (o.status === 'pending') {
            items.push({
              id: `wait_${o.id}`,
              type: 'pending',
              emoji: '⏳',
              title: 'リクエストを審査中です',
              body: `承認されると制作が始まります`,
              time: o.createdAt,
            })
          }
        })
      }
    }

    // 新しい順に並べる
    items.sort((a, b) => new Date(b.time) - new Date(a.time))
    setNotifications(items)
  }, [user?.id, user?.talentProfile?.setupComplete])

  useEffect(() => { buildNotifications() }, [buildNotifications])

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  const markAllRead = useCallback(() => {
    const next = new Set([...readIds, ...notifications.map(n => n.id)])
    setReadIds(next)
    saveRead(next)
  }, [readIds, notifications])

  const markRead = useCallback((id) => {
    const next = new Set([...readIds, id])
    setReadIds(next)
    saveRead(next)
  }, [readIds])

  const isRead = useCallback((id) => readIds.has(id), [readIds])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, isRead, refresh: buildNotifications }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationsProvider')
  return ctx
}
