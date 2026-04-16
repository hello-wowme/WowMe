import { createContext, useContext, useState, useEffect } from 'react'

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

  const login = (googleProfile, role) => {
    const isAdmin = googleProfile.email === ADMIN_EMAIL
    const userData = {
      id: googleProfile.sub || `demo_${Date.now()}`,
      name: googleProfile.name,
      email: googleProfile.email,
      picture: googleProfile.picture,
      role: isAdmin ? 'admin' : role, // 'user' | 'talent' | 'admin'
      isAdmin,
      isDemo: googleProfile.isDemo || false,
    }
    setUser(userData)
    localStorage.setItem('wowme_user', JSON.stringify(userData))
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

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
