import { createContext, useContext, useState, useCallback } from 'react'

const TalentsContext = createContext(null)

const STORAGE_KEY = 'wowme_registered_talents'

function loadTalents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveTalents(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function TalentsProvider({ children }) {
  const [registeredTalents, setRegisteredTalents] = useState(loadTalents)

  const removeTalent = useCallback((userId) => {
    setRegisteredTalents(prev => {
      const next = prev.filter(t => t.userId !== userId)
      saveTalents(next)
      return next
    })
  }, [])

  const registerTalent = useCallback((userId, profile) => {
    setRegisteredTalents(prev => {
      // 既存ユーザーなら上書き、新規なら追加
      const exists = prev.findIndex(t => t.userId === userId)
      const talent = {
        id: `user_${userId}`,
        userId,
        name: profile.displayName,
        category: profile.category,
        bio: profile.bio || '',
        price: Number(profile.price),
        responseTime: profile.responseTime <= 24 ? '24時間以内'
          : profile.responseTime <= 48 ? '48時間以内'
          : profile.responseTime <= 72 ? '72時間以内'
          : '1週間以内',
        avatar: profile.avatar || '',
        tags: profile.tags || [],
        sampleVideos: profile.sampleVideos || [],
        available: profile.available !== false,
        featured: false,
        rating: profile.rating || 0,
        reviewCount: profile.reviewCount || 0,
        totalOrders: profile.totalOrders || 0,
        level: profile.level || 1,
        completionRate: profile.completionRate || 100,
        isRegistered: true,
      }
      const next = exists >= 0
        ? prev.map((t, i) => i === exists ? talent : t)
        : [...prev, talent]
      saveTalents(next)
      return next
    })
  }, [])

  return (
    <TalentsContext.Provider value={{ registeredTalents, registerTalent, removeTalent }}>
      {children}
    </TalentsContext.Provider>
  )
}

export const useTalents = () => {
  const ctx = useContext(TalentsContext)
  if (!ctx) throw new Error('useTalents must be used within TalentsProvider')
  return ctx
}
