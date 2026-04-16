import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { talents, categories } from '../data/mockData'
import TalentCard from '../components/UI/TalentCard'

const SORT_OPTIONS = [
  { value: 'popular', label: '人気順' },
  { value: 'price_low', label: '価格が低い順' },
  { value: 'price_high', label: '価格が高い順' },
  { value: 'rating', label: '評価が高い順' },
]

export default function TalentListPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sort, setSort] = useState('popular')
  const [priceRange, setPriceRange] = useState([0, 20000])
  const [showFilters, setShowFilters] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)

  const filtered = useMemo(() => {
    let list = [...talents]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }
    if (activeCategory !== 'all') {
      const map = { music: '音楽', actor: '俳優', youtuber: 'YouTuber', sports: 'スポーツ', model: 'モデル', dj: 'DJ' }
      list = list.filter(t => t.category.includes(map[activeCategory] || ''))
    }
    list = list.filter(t => t.price >= priceRange[0] && t.price <= priceRange[1])
    if (availableOnly) list = list.filter(t => t.available)
    switch (sort) {
      case 'price_low': list.sort((a, b) => a.price - b.price); break
      case 'price_high': list.sort((a, b) => b.price - a.price); break
      case 'rating': list.sort((a, b) => b.rating - a.rating); break
      default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }
    return list
  }, [search, activeCategory, sort, priceRange, availableOnly])

  return (
    <div className="min-h-screen pt-24 pb-20 page-enter bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            タレントを<span className="gradient-text">探す</span>
          </h1>
          <p className="text-gray-400">{talents.length}人のタレントが参加中</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            placeholder="名前・カテゴリ・タグで検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-14 pr-14 py-4 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-base shadow-sm"
            style={{ '--tw-ring-color': '#FE3B8C44' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-3 overflow-x-auto pb-2 mb-6">
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-pink-200 hover:text-[#FE3B8C]'
              }`}
              style={activeCategory === cat.id ? { background: 'linear-gradient(135deg, #FE3B8C, #0080FF)', boxShadow: '0 4px 16px rgba(254,59,140,0.3)' } : {}}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Toolbar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">
              <span className="text-gray-900 font-semibold">{filtered.length}</span> 件
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setAvailableOnly(!availableOnly)}
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{ background: availableOnly ? '#FE3B8C' : '#E5E7EB' }}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${availableOnly ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-gray-400">受付中のみ</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                showFilters
                  ? 'border-[#FE3B8C] text-[#FE3B8C] bg-pink-50'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-pink-200 hover:text-[#FE3B8C]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              フィルター
            </button>

            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-white border border-gray-200 text-sm text-gray-600 pl-4 pr-10 py-2 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-200 shadow-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl p-6 mb-8 overflow-hidden border border-gray-100 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">価格帯</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">¥{priceRange[0].toLocaleString()}</span>
                <input type="range" min="0" max="20000" step="500" value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="flex-1" style={{ accentColor: '#FE3B8C' }} />
                <span className="text-sm text-gray-500">¥{priceRange[1].toLocaleString()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {filtered.length > 0 ? (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((talent, i) => (
                <motion.div key={talent.id} layout exit={{ opacity: 0, scale: 0.9 }}>
                  <TalentCard talent={talent} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">見つかりませんでした</h3>
            <p className="text-gray-400">検索条件を変更してみてください</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="mt-6 btn-ghost text-sm px-6 py-3">
              条件をリセット
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
