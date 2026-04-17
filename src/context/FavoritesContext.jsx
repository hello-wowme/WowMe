import { createContext, useContext, useState, useCallback } from 'react'

const FavoritesContext = createContext(null)
const LS_KEY = 'wowme_favorites'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(load) // タレントオブジェクトの配列

  const toggleFavorite = useCallback((talent) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === talent.id)
      const next = exists
        ? prev.filter(f => f.id !== talent.id)
        : [...prev, talent]
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((talentId) => {
    return favorites.some(f => f.id === talentId)
  }, [favorites])

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
