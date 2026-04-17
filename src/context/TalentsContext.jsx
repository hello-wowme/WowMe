import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  fetchTalentProfiles,
  upsertTalentProfile,
  deleteTalentProfile,
  dbTalentToApp,
  isSupabaseReady,
} from '../lib/db'
import { isSupabaseReady as checkReady } from '../lib/supabase'

const TalentsContext = createContext(null)

// localStorage フォールバック
const LS_KEY = 'wowme_registered_talents'
function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function lsSave(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)) }

export function TalentsProvider({ children }) {
  const [registeredTalents, setRegisteredTalents] = useState([])
  const [loading, setLoading] = useState(true)

  // 起動時: Supabase があれば DB から、なければ localStorage から取得
  useEffect(() => {
    const load = async () => {
      if (checkReady()) {
        const { data, error } = await fetchTalentProfiles()
        if (!error && data) {
          setRegisteredTalents(data.map(dbTalentToApp))
        } else {
          setRegisteredTalents(lsLoad())
        }
      } else {
        setRegisteredTalents(lsLoad())
      }
      setLoading(false)
    }
    load()
  }, [])

  const registerTalent = useCallback(async (userId, profile) => {
    const talentData = {
      id:            `user_${userId}`,
      userId,
      name:          profile.displayName,
      category:      profile.category,
      bio:           profile.bio || '',
      price:         Number(profile.price),
      responseTime:  profile.responseTime <= 24 ? '24時間以内'
                   : profile.responseTime <= 48 ? '48時間以内'
                   : profile.responseTime <= 72 ? '72時間以内'
                   : '1週間以内',
      avatar:        profile.avatar || '',
      tags:          profile.tags || [],
      available:     profile.available !== false,
      level:         profile.level || 1,
      totalOrders:   profile.totalOrders || 0,
      rating:        profile.rating || 0,
      reviewCount:   profile.reviewCount || 0,
      setupComplete: profile.setupComplete ?? false,
      completionRate: 100,
      featured:      false,
      isRegistered:  true,
      sampleVideos:  [],
      reviews:       [],
      handle:        '',
      cover:         profile.avatar || '',
    }

    // Supabase に保存
    if (checkReady()) {
      const { data, error } = await upsertTalentProfile(userId, profile)
      if (!error && data) {
        const appTalent = dbTalentToApp(data)
        setRegisteredTalents(prev => {
          const next = prev.some(t => t.userId === userId)
            ? prev.map(t => t.userId === userId ? appTalent : t)
            : [...prev, appTalent]
          return next
        })
        return
      }
    }

    // fallback: localStorage
    setRegisteredTalents(prev => {
      const next = prev.some(t => t.userId === userId)
        ? prev.map(t => t.userId === userId ? talentData : t)
        : [...prev, talentData]
      lsSave(next)
      return next
    })
  }, [])

  const removeTalent = useCallback(async (userId) => {
    if (checkReady()) {
      await deleteTalentProfile(userId)
    }
    setRegisteredTalents(prev => {
      const next = prev.filter(t => t.userId !== userId)
      lsSave(next)
      return next
    })
  }, [])

  // 受付トグルをDBに反映
  const updateAvailability = useCallback(async (userId, available) => {
    if (checkReady()) {
      const { updateTalentAvailability } = await import('../lib/db')
      await updateTalentAvailability(userId, available)
    }
    setRegisteredTalents(prev => {
      const next = prev.map(t => t.userId === userId ? { ...t, available } : t)
      lsSave(next)
      return next
    })
  }, [])

  return (
    <TalentsContext.Provider value={{ registeredTalents, registerTalent, removeTalent, updateAvailability, loading }}>
      {children}
    </TalentsContext.Provider>
  )
}

export const useTalents = () => {
  const ctx = useContext(TalentsContext)
  if (!ctx) throw new Error('useTalents must be used within TalentsProvider')
  return ctx
}
