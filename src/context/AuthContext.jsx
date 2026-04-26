import { createContext, useContext, useState } from 'react'
import { upsertUser, fetchTalentProfileForLogin } from '../lib/db'

const ADMIN_EMAIL = 'hello.wowme@gmail.com'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wowme_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = async (googleProfile, role) => {
    const isAdmin = googleProfile.email === ADMIN_EMAIL

    let userData = {
      id:      googleProfile.sub || `demo_${Date.now()}`,
      name:    googleProfile.name,
      email:   googleProfile.email,
      picture: googleProfile.picture,
      role:    isAdmin ? 'admin' : role,
      isAdmin,
      isDemo:  googleProfile.isDemo || false,
    }

    // ── Supabase が有効なら既存タレントプロフィールを復元 ──────────────
    if (!googleProfile.isDemo) {
      try {
        const tp = await fetchTalentProfileForLogin(userData.id)
        if (tp) {
          userData.talentProfile = tp
          // talent ロールが未設定の場合は自動昇格（管理者は除く）
          if (!isAdmin) userData.role = 'talent'
        }
      } catch (e) {
        console.warn('talentProfile fetch failed:', e)
      }
    }

    setUser(userData)
    localStorage.setItem('wowme_user', JSON.stringify(userData))

    // Supabase にユーザー基本情報を保存（非同期・失敗しても続行）
    upsertUser(userData).catch(console.error)

    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('wowme_user')
  }

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('wowme_user', JSON.stringify(updated))
  }

  // Supabase から最新プロフィールを再取得して同期
  const refreshProfile = async () => {
    if (!user?.id || user?.isDemo) return
    try {
      const tp = await fetchTalentProfileForLogin(user.id)
      if (tp) {
        const updated = { ...user, talentProfile: tp, role: user.isAdmin ? 'admin' : 'talent' }
        setUser(updated)
        localStorage.setItem('wowme_user', JSON.stringify(updated))
      }
    } catch (e) {
      console.warn('refreshProfile failed:', e)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
