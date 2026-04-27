import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ImagePlus, Plus, X, Check, ChevronRight, Upload, Sparkles, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTalents } from '../context/TalentsContext'
import { uploadAvatar, uploadCover } from '../lib/db'

const RESPONSE_OPTIONS = [
  { value: 24, label: '24時間以内' },
  { value: 48, label: '48時間以内' },
  { value: 72, label: '72時間以内' },
  { value: 168, label: '1週間以内' },
]

const CATEGORY_OPTIONS = [
  'シンガーソングライター', '俳優', 'YouTuber / VTuber', 'モデル / インフルエンサー',
  'プロスポーツ選手', 'DJ / アーティスト', 'コメディアン', 'アーティスト', 'その他',
]

const STEPS = [
  { id: 'basic', label: '基本情報', icon: '👤' },
  { id: 'pricing', label: '料金設定', icon: '💰' },
  { id: 'media', label: 'メディア', icon: '🎬' },
  { id: 'complete', label: '完了', icon: '🎉' },
]

export default function TalentProfileSetup() {
  const { user, updateProfile } = useAuth()
  const { registerTalent } = useTalents()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const existing = user?.talentProfile || {}
  const [profile, setProfile] = useState({
    displayName:   existing.displayName  || user?.name   || '',
    bio:           existing.bio          || '',
    category:      existing.category     || '',
    tags:          existing.tags         || [],
    tagInput:      '',
    price:              existing.price        ? String(existing.price) : '',
    responseTime:       existing.responseTime || 24,
    snsPermission:      existing.snsPermission || 'ok',
    orderLimitEnabled:  existing.orderLimitEnabled ?? false,
    orderLimit:         existing.orderLimit ? String(existing.orderLimit) : '10',
    avatarPreview: existing.avatar       || user?.picture || '',
    coverPreview:  existing.cover        || '',
    sampleVideos:  [],
  })

  const updateField = (field, value) => setProfile(p => ({ ...p, [field]: value }))

  const addTag = () => {
    const tag = profile.tagInput.trim()
    if (tag && !profile.tags.includes(tag) && profile.tags.length < 5) {
      updateField('tags', [...profile.tags, tag])
      updateField('tagInput', '')
    }
  }

  const removeTag = (tag) => updateField('tags', profile.tags.filter(t => t !== tag))

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    updateField('avatarPreview', URL.createObjectURL(file))
    updateField('avatarFile', file)
  }

  const handleCoverUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    updateField('coverPreview', URL.createObjectURL(file))
    updateField('coverFile', file)
  }

  const handleSampleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file && profile.sampleVideos.length < 3) {
      const url = URL.createObjectURL(file)
      updateField('sampleVideos', [...profile.sampleVideos, { url, name: file.name, thumbnail: null }])
    }
  }

  const canProceed = () => {
    if (step === 0) return !!(profile.displayName && profile.category && profile.avatarPreview && profile.coverPreview)
    if (step === 1) return !!(profile.price && Number(profile.price) > 0)
    return true
  }

  const handleComplete = async () => {
    let avatarUrl = profile.avatarPreview
    let coverUrl  = profile.coverPreview

    if (profile.avatarFile) {
      const { url, error } = await uploadAvatar(user.id, profile.avatarFile)
      if (!error && url) avatarUrl = url
    }
    if (profile.coverFile) {
      const { url, error } = await uploadCover(user.id, profile.coverFile)
      if (!error && url) coverUrl = url
    }

    const talentProfile = {
      displayName:   profile.displayName,
      bio:           profile.bio,
      category:      profile.category,
      tags:          profile.tags,
      price:             Number(profile.price),
      responseTime:      profile.responseTime,
      snsPermission:     profile.snsPermission,
      orderLimitEnabled: profile.orderLimitEnabled,
      orderLimit:        profile.orderLimitEnabled ? Number(profile.orderLimit) || 10 : null,
      avatar:        avatarUrl,
      cover:         coverUrl,
      sampleVideos:  profile.sampleVideos,
      setupComplete: true,
      level:         1,
      totalOrders:   0,
      rating:        0,
    }
    updateProfile({ talentProfile })
    await registerTalent(user.id, talentProfile)
    setStep(3)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col page-enter"
      style={{ background: 'linear-gradient(160deg, #fff0f6 0%, #f0f6ff 60%, #f5f7fa 100%)' }}>
      <div className="max-w-xl mx-auto px-4 w-full flex-1 flex flex-col">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-medium mb-1" style={{ color: '#FE3B8C' }}>タレント登録</p>
          <h1 className="text-2xl font-black text-gray-900">プロフィールを設定しよう</h1>
        </motion.div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
              <motion.div
                animate={{ scale: i === step ? 1.1 : 1 }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0 transition-all"
                style={{
                  background: i < step ? 'linear-gradient(135deg, #FE3B8C, #0080FF)' : i === step ? '#fff' : '#F5F7FA',
                  borderColor: i <= step ? '#FE3B8C' : '#E5E7EB',
                  color: i < step ? '#fff' : i === step ? '#FE3B8C' : '#9CA3AF',
                  boxShadow: i === step ? '0 0 0 4px rgba(254,59,140,0.12)' : 'none',
                }}
              >
                {i < step ? <Check className="w-4 h-4" /> : s.icon}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                  <motion.div animate={{ width: i < step ? '100%' : '0%' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #FE3B8C, #0080FF)' }}
                    transition={{ duration: 0.4 }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <motion.div key="basic"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 space-y-6"
              >
                <h2 className="font-bold text-gray-900 text-lg">基本情報</h2>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    ヘッダー画像 <span className="text-[#FE3B8C]">*</span>
                  </label>
                  <label className="relative block w-full h-32 rounded-2xl overflow-hidden cursor-pointer group"
                    style={{ border: profile.coverPreview ? 'none' : '2px dashed #E5E7EB', background: profile.coverPreview ? 'transparent' : '#FAFAFA' }}>
                    {profile.coverPreview
                      ? <img src={profile.coverPreview} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <ImagePlus className="w-8 h-8 text-gray-300" />
                          <p className="text-sm text-gray-400">クリックして画像を追加</p>
                          <p className="text-xs text-gray-300">JPG, PNG（推奨: 1200×400px）</p>
                        </div>
                    }
                    {profile.coverPreview && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">変更する</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    プロフィール画像 <span className="text-[#FE3B8C]">*</span>
                  </label>
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center"
                        style={{ border: '2px dashed #E5E7EB' }}>
                        {profile.avatarPreview
                          ? <img src={profile.avatarPreview} alt="" className="w-full h-full object-cover" />
                          : <Camera className="w-8 h-8 text-gray-300" />
                        }
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                        <Plus className="w-4 h-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">JPG, PNG（推奨: 400×400px）</p>
                      {!profile.avatarPreview && (
                        <p className="text-xs mt-1" style={{ color: '#FE3B8C' }}>※ 必須項目です</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">表示名 <span className="text-[#FE3B8C]">*</span></label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={e => updateField('displayName', e.target.value)}
                    placeholder="例：葉月 りの"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': '#FE3B8C44' }}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">自己紹介</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => updateField('bio', e.target.value)}
                    placeholder="あなたのことをファンに伝えましょう..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ '--tw-ring-color': '#FE3B8C44' }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">カテゴリ <span className="text-[#FE3B8C]">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORY_OPTIONS.map(cat => (
                      <button key={cat} onClick={() => updateField('category', cat)}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border"
                        style={{
                          background: profile.category === cat ? 'linear-gradient(135deg, #fff0f6, #f0f6ff)' : '#FAFAFA',
                          borderColor: profile.category === cat ? '#FE3B8C' : '#F0F0F5',
                          color: profile.category === cat ? '#FE3B8C' : '#6B7280',
                        }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">タグ（最大5つ）</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={profile.tagInput}
                      onChange={e => updateField('tagInput', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTag()}
                      placeholder="例：ポップ、ライブ"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#FE3B8C44' }}
                    />
                    <button onClick={addTag}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                      追加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                        {tag}
                        <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Pricing */}
            {step === 1 && (
              <motion.div key="pricing"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 space-y-6"
              >
                <h2 className="font-bold text-gray-900 text-lg">料金・返答設定</h2>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    リクエスト料金 <span className="text-[#FE3B8C]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">¥</span>
                    <input
                      type="number"
                      value={profile.price}
                      onChange={e => updateField('price', e.target.value)}
                      placeholder="5000"
                      min="500"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3.5 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-transparent text-xl font-bold"
                      style={{ '--tw-ring-color': '#FE3B8C44' }}
                    />
                  </div>
                  {profile.price && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-3 p-3 rounded-xl text-sm"
                      style={{ background: '#f0f6ff' }}>
                      <div className="flex justify-between text-gray-500">
                        <span>あなたの取り分（80%）</span>
                        <span className="font-bold text-gray-900">¥{Math.floor(Number(profile.price) * 0.8).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 text-xs mt-1">
                        <span>運営手数料（20%）</span>
                        <span>¥{Math.floor(Number(profile.price) * 0.2).toLocaleString()}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Preset prices */}
                <div>
                  <p className="text-xs text-gray-400 mb-3">よく使われる料金</p>
                  <div className="flex flex-wrap gap-2">
                    {[3000, 5000, 8000, 10000, 15000].map(p => (
                      <button key={p} onClick={() => updateField('price', String(p))}
                        className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                        style={{
                          borderColor: Number(profile.price) === p ? '#FE3B8C' : '#E5E7EB',
                          color: Number(profile.price) === p ? '#FE3B8C' : '#6B7280',
                          background: Number(profile.price) === p ? '#fff0f6' : '#fff',
                        }}>
                        ¥{p.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-3">返答時間</label>
                  <div className="grid grid-cols-2 gap-3">
                    {RESPONSE_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => updateField('responseTime', opt.value)}
                        className="flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all"
                        style={{
                          borderColor: profile.responseTime === opt.value ? '#FE3B8C' : '#F0F0F5',
                          background: profile.responseTime === opt.value ? '#fff0f6' : '#FAFAFA',
                        }}>
                        <Clock className="w-5 h-5 flex-shrink-0"
                          style={{ color: profile.responseTime === opt.value ? '#FE3B8C' : '#9CA3AF' }} />
                        <span className="font-medium text-sm"
                          style={{ color: profile.responseTime === opt.value ? '#FE3B8C' : '#374151' }}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SNS Permission */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">SNS公開設定</label>
                  <p className="text-xs text-gray-400 mb-3">ファンが動画をSNSにシェアすることを許可するか設定します</p>
                  <select
                    value={profile.snsPermission}
                    onChange={e => updateField('snsPermission', e.target.value)}
                    className="w-full border-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none transition-all appearance-none bg-white"
                    style={{ borderColor: '#F0F0F5' }}
                    onFocus={e => e.target.style.borderColor = '#FE3B8C'}
                    onBlur={e => e.target.style.borderColor = '#F0F0F5'}
                  >
                    <option value="ok">✅ SNS公開OK（ファンはSNSシェア可）</option>
                    <option value="ng">🔒 SNS公開NG（シェア禁止・本人保存のみ）</option>
                  </select>
                  <div className="mt-2 px-4 py-3 rounded-xl text-xs"
                    style={{
                      background: profile.snsPermission === 'ok' ? '#f0fdf4' : '#fff7ed',
                      color: profile.snsPermission === 'ok' ? '#16a34a' : '#ea580c',
                    }}>
                    {profile.snsPermission === 'ok'
                      ? '✨ ファンは動画をXなどにシェアできます。拡散によって認知度アップが期待できます。'
                      : '🔒 ファンは動画をシェアできません。受け取ったファン本人のみ保存・閲覧できます。'}
                  </div>
                </div>

                {/* Order Limit */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">受付個数制限</label>
                      <p className="text-xs text-gray-400 mt-0.5">同時に受け付けるリクエスト数を制限します</p>
                    </div>
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => updateField('orderLimitEnabled', !profile.orderLimitEnabled)}
                      className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 focus:outline-none"
                      style={{ background: profile.orderLimitEnabled ? '#FE3B8C' : '#E5E7EB' }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                        style={{ transform: profile.orderLimitEnabled ? 'translateX(24px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>

                  {profile.orderLimitEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 rounded-2xl border-2 space-y-3"
                        style={{ borderColor: '#FE3B8C44', background: '#fff0f6' }}>
                        <p className="text-xs font-medium" style={{ color: '#FE3B8C' }}>同時受付の上限数</p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateField('orderLimit', String(Math.max(1, Number(profile.orderLimit) - 1)))}
                            className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all"
                            style={{ borderColor: '#FE3B8C44', color: '#FE3B8C', background: '#fff' }}>
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={profile.orderLimit}
                            onChange={e => updateField('orderLimit', e.target.value)}
                            className="w-20 text-center border-2 rounded-xl py-2 text-xl font-bold text-gray-800 focus:outline-none"
                            style={{ borderColor: '#FE3B8C44' }}
                          />
                          <button
                            type="button"
                            onClick={() => updateField('orderLimit', String(Number(profile.orderLimit) + 1))}
                            className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all"
                            style={{ borderColor: '#FE3B8C44', color: '#FE3B8C', background: '#fff' }}>
                            ＋
                          </button>
                          <span className="text-sm text-gray-500">件まで</span>
                        </div>
                        <p className="text-xs text-gray-400">上限に達すると新規リクエストは受け付けられなくなります</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Media */}
            {step === 2 && (
              <motion.div key="media"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 space-y-6"
              >
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">サンプル動画</h2>
                  <p className="text-gray-400 text-sm mt-1">ファンにあなたの雰囲気を伝えましょう（最大3本）</p>
                </div>

                {/* Upload Area */}
                <label className="flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                  style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FE3B8C'; e.currentTarget.style.background = '#fff0f6' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#FAFAFA' }}>
                  <Upload className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-500">クリックして動画を追加</p>
                  <p className="text-xs text-gray-300 mt-1">MP4, MOV 最大100MB</p>
                  <input type="file" accept="video/*" className="hidden" onChange={handleSampleVideoUpload}
                    disabled={profile.sampleVideos.length >= 3} />
                </label>

                {/* Uploaded Videos */}
                {profile.sampleVideos.length > 0 && (
                  <div className="space-y-3">
                    {profile.sampleVideos.map((video, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                          🎬
                        </div>
                        <p className="text-sm text-gray-600 flex-1 truncate">{video.name}</p>
                        <button onClick={() => updateField('sampleVideos', profile.sampleVideos.filter((_, j) => j !== i))}
                          className="text-gray-300 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Skip option */}
                <p className="text-xs text-center text-gray-400">
                  あとから追加することもできます
                </p>
              </motion.div>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <motion.div key="complete"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center"
              >
                {/* Celebration */}
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}
                >
                  <Sparkles className="w-14 h-14 text-white" />
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-3xl font-black text-gray-900 mb-3">
                  登録完了！🎉
                </motion.h2>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="text-gray-400 mb-3">
                  <span className="font-bold text-gray-800">{profile.displayName}</span> さんとして<br />WowMeへようこそ！
                </motion.p>

                {profile.price && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white mb-6 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                    ¥{Number(profile.price).toLocaleString()} / リクエスト
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/talent-dashboard')}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base mt-2"
                >
                  ダッシュボードへ
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step < 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-2 px-6">
                ← 戻る
              </button>
            )}
            <motion.button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              whileHover={canProceed() ? { scale: 1.02 } : {}}
              whileTap={canProceed() ? { scale: 0.97 } : {}}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              次へ <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2 px-6">
              ← 戻る
            </button>
            <motion.button
              onClick={handleComplete}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              登録する 🎉
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
