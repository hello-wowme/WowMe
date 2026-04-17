import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Sparkles, Heart, Gift, CreditCard, Lock, Zap } from 'lucide-react'
import { talents, occasions } from '../data/mockData'

const STEPS = [
  { id: 'occasion', label: 'シーンを選ぶ', icon: '🎯' },
  { id: 'message', label: 'メッセージを書く', icon: '✍️' },
  { id: 'payment', label: 'お支払い', icon: '💳' },
  { id: 'complete', label: '完了', icon: '🎉' },
]

const SUGGESTIONS = {
  birthday: ['〇〇の誕生日をお祝いしてください！', '大好きな友人の誕生日に贈ります', '特別な日に名前を呼んでください'],
  graduation: ['卒業おめでとうのメッセージをお願いします', '新しいステージへの応援をお願いします'],
  cheering: ['就職活動中の弟を励ましてください', '大会前の娘を応援してください', '受験生へのメッセージをお願いします'],
  gift: ['プレゼントとして贈ります', '大切な人へのサプライズです'],
  just_for_me: ['自分へのご褒美です！', '一人で楽しむので思い切り盛り上げてください'],
}

export default function RequestFlowPage() {
  const { id } = useParams()
  const talent = talents.find(t => t.id === id) || talents[0]

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    occasion: '', recipientName: '', message: '',
    isGift: false, instructions: '',
    cardNumber: '4242 4242 4242 4242', cardExpiry: '12/26', cardCVC: '123',
  })
  const [charCount, setCharCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [nameError, setNameError] = useState('')

  const handleRecipientNameChange = (e) => {
    const value = e.target.value
    // ひらがな・長音符・スペースのみ許可
    const hiraganaOnly = /^[\u3040-\u309F\u30FC\s]*$/
    if (value === '' || hiraganaOnly.test(value)) {
      setForm(f => ({ ...f, recipientName: value }))
      setNameError('')
    } else {
      setNameError('ひらがなのみ入力できます')
    }
  }

  const handleNext = () => { if (step < STEPS.length - 1) setStep(s => s + 1) }
  const handleBack = () => { if (step > 0) setStep(s => s - 1) }

  const handleSubmit = async () => {
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsProcessing(false)
    setStep(3)
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex flex-col page-enter bg-[#F5F7FA]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col">
        {/* Progress Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          {step < 3 && (
            <Link to={`/talent/${talent.id}`} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors text-sm mb-6">
              <ChevronLeft className="w-4 h-4" />
              {talent.name}に戻る
            </Link>
          )}

          {/* Step Indicators */}
          <div className="flex items-center gap-2 mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
                <motion.div
                  animate={{
                    scale: i === step ? 1.1 : 1,
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0 transition-all"
                  style={{
                    background: i < step ? 'linear-gradient(135deg, #FE3B8C, #0080FF)' : i === step ? '#fff' : '#F5F7FA',
                    borderColor: i <= step ? '#FE3B8C' : '#E5E7EB',
                    color: i < step ? '#fff' : i === step ? '#FE3B8C' : '#9CA3AF',
                    boxShadow: i === step ? '0 0 0 4px rgba(254,59,140,0.12)' : 'none',
                  }}
                >
                  {i < step ? <Check className="w-4 h-4" /> : <span>{s.icon}</span>}
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-100 hidden sm:block rounded-full overflow-hidden">
                    <motion.div animate={{ width: i < step ? '100%' : '0%' }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #FE3B8C, #0080FF)' }}
                      transition={{ duration: 0.4 }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {step < 3 && (
            <div>
              <p className="text-xs text-gray-400">ステップ {step + 1} / {STEPS.length - 1}</p>
              <h1 className="text-xl font-bold text-gray-900 mt-1">{STEPS[step].label}</h1>
            </div>
          )}
        </motion.div>

        {/* Talent Preview */}
        {step < 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 mb-8 border border-gray-100 shadow-sm">
            <img src={talent.avatar} alt={talent.name} className="w-14 h-14 rounded-2xl object-cover" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{talent.name}</p>
              <p className="text-xs text-gray-400">{talent.category}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">¥{talent.price.toLocaleString()}</p>
              <p className="text-xs text-gray-400">リクエスト料金</p>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {/* Step 0: Occasion */}
            {step === 0 && (
              <motion.div key="occasion"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="space-y-4">
                <p className="text-gray-400 text-sm mb-6">どんなシーンで使いますか？</p>
                <div className="grid grid-cols-2 gap-3">
                  {occasions.map(occ => (
                    <motion.button key={occ.id} onClick={() => setForm(f => ({ ...f, occasion: occ.id }))}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="p-4 rounded-2xl text-left transition-all border-2"
                      style={{
                        background: form.occasion === occ.id ? 'linear-gradient(135deg, #fff0f6, #f0f6ff)' : '#fff',
                        borderColor: form.occasion === occ.id ? '#FE3B8C' : '#F0F0F5',
                        boxShadow: form.occasion === occ.id ? '0 4px 16px rgba(254,59,140,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <span className="text-3xl mb-2 block">{occ.emoji}</span>
                      <p className="font-semibold text-gray-800 text-sm">{occ.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{occ.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Message */}
            {step === 1 && (
              <motion.div key="message"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
                {/* Gift Toggle */}
                <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fff0f6' }}>
                      <Gift className="w-5 h-5" style={{ color: '#FE3B8C' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">誰かへのプレゼント？</p>
                      <p className="text-xs text-gray-400">受取人の名前を指定できます</p>
                    </div>
                  </div>
                  <div onClick={() => setForm(f => ({ ...f, isGift: !f.isGift }))}
                    className="w-12 h-6 rounded-full transition-all cursor-pointer relative"
                    style={{ background: form.isGift ? '#FE3B8C' : '#E5E7EB' }}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${form.isGift ? 'left-6' : 'left-0.5'}`} />
                  </div>
                </div>

                {form.isGift && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      受取人の名前 <span style={{ color: '#FE3B8C' }}>*</span>
                    </label>
                    <input type="text" placeholder="例：さくら" value={form.recipientName}
                      onChange={handleRecipientNameChange}
                      className="w-full bg-white border-2 rounded-xl px-5 py-3.5 text-gray-800 placeholder:text-gray-300 focus:outline-none transition-all"
                      style={{ borderColor: nameError ? '#EF4444' : '#F0F0F5' }}
                      onFocus={e => e.target.style.borderColor = nameError ? '#EF4444' : '#FE3B8C'}
                      onBlur={e => e.target.style.borderColor = nameError ? '#EF4444' : '#F0F0F5'} />
                    {nameError && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> {nameError}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 mt-1">ひらがなのみ入力できます（例：さくら）</p>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    メッセージ内容 <span style={{ color: '#FE3B8C' }}>*</span>
                  </label>
                  <div className="relative">
                    <textarea placeholder="どんなメッセージを届けたいですか？できるだけ具体的に書いてください..."
                      value={form.message}
                      onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setCharCount(e.target.value.length) }}
                      rows={5} maxLength={300}
                      className="w-full bg-white border-2 border-gray-100 rounded-xl px-5 py-4 text-gray-800 placeholder:text-gray-300 focus:outline-none resize-none"
                      onFocus={e => e.target.style.borderColor = '#FE3B8C'}
                      onBlur={e => e.target.style.borderColor = '#F0F0F5'} />
                    <span className={`absolute bottom-3 right-4 text-xs ${charCount > 270 ? 'text-amber-500' : 'text-gray-300'}`}>
                      {charCount}/300
                    </span>
                  </div>
                </div>

                {form.occasion && SUGGESTIONS[form.occasion] && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FE3B8C]" />
                      メッセージの例（タップして入力）
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS[form.occasion].map(s => (
                        <button key={s}
                          onClick={() => { setForm(f => ({ ...f, message: s })); setCharCount(s.length) }}
                          className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-500 hover:border-pink-300 hover:text-[#FE3B8C] transition-all">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">その他の指示（任意）</label>
                  <input type="text" placeholder="例：明るく元気に、英語を少し交えて、など"
                    value={form.instructions}
                    onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-5 py-3.5 text-gray-800 placeholder:text-gray-300 focus:outline-none transition-all"
                    onFocus={e => e.target.style.borderColor = '#0080FF'}
                    onBlur={e => e.target.style.borderColor = '#F0F0F5'} />
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div key="payment"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl p-5 space-y-3 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">注文内容確認</h3>
                  {[
                    { label: 'タレント', value: talent.name },
                    { label: 'シーン', value: occasions.find(o => o.id === form.occasion)?.label || form.occasion },
                    { label: '受取人', value: form.isGift ? (form.recipientName || '未入力') : '自分' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-800 font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-100 flex justify-between">
                    <span className="text-gray-400 text-sm">合計</span>
                    <span className="text-xl font-black text-gray-900">¥{talent.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Card Input */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-400">SSL暗号化で安全に決済</span>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">カード番号</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input type="text" value={form.cardNumber}
                        onChange={e => setForm(f => ({ ...f, cardNumber: e.target.value }))}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl pl-12 pr-5 py-3.5 text-gray-800 focus:outline-none"
                        onFocus={e => e.target.style.borderColor = '#FE3B8C'}
                        onBlur={e => e.target.style.borderColor = '#F0F0F5'} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">有効期限</label>
                      <input type="text" value={form.cardExpiry} placeholder="MM/YY"
                        onChange={e => setForm(f => ({ ...f, cardExpiry: e.target.value }))}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-5 py-3.5 text-gray-800 placeholder:text-gray-300 focus:outline-none"
                        onFocus={e => e.target.style.borderColor = '#FE3B8C'}
                        onBlur={e => e.target.style.borderColor = '#F0F0F5'} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">セキュリティコード</label>
                      <input type="text" value={form.cardCVC} placeholder="CVC"
                        onChange={e => setForm(f => ({ ...f, cardCVC: e.target.value }))}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-5 py-3.5 text-gray-800 placeholder:text-gray-300 focus:outline-none"
                        onFocus={e => e.target.style.borderColor = '#FE3B8C'}
                        onBlur={e => e.target.style.borderColor = '#F0F0F5'} />
                    </div>
                  </div>
                </div>

                <motion.button onClick={handleSubmit} disabled={isProcessing}
                  whileHover={!isProcessing ? { scale: 1.03 } : {}}
                  whileTap={!isProcessing ? { scale: 0.97 } : {}}
                  className="btn-primary w-full flex items-center justify-center gap-3 text-base py-5">
                  {isProcessing ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      処理中...
                    </>
                  ) : (
                    <><Lock className="w-5 h-5" />¥{talent.price.toLocaleString()} を支払う</>
                  )}
                </motion.button>

                <p className="text-xs text-center text-gray-300">※ これはデモです。実際の決済は行われません</p>
              </motion.div>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <motion.div key="complete"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="relative inline-block mb-8">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                    <Heart className="w-16 h-16 text-white fill-white" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={i}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: [0, 1.5, 0], opacity: [1, 0.5, 0], x: Math.cos(i * 60 * Math.PI / 180) * 80, y: Math.sin(i * 60 * Math.PI / 180) * 80 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                      style={{ background: i % 2 === 0 ? '#FE3B8C' : '#0080FF' }} />
                  ))}
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-4xl font-black text-gray-900 mb-4">リクエスト完了！</motion.h2>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-gray-500 mb-2 text-lg">
                  <span className="font-semibold" style={{ color: '#FE3B8C' }}>{talent.name}</span> さんがあなたへの
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                  className="text-gray-500 mb-10 text-lg">特別なメッセージを準備中です ✨</motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                  className="bg-white rounded-2xl p-5 mb-8 text-left border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <p className="font-semibold text-gray-900">次のステップ</p>
                  </div>
                  {[
                    `${talent.responseTime}以内に動画が届きます`,
                    'マイページから受け取り状況を確認できます',
                    '完成したらメールでお知らせします',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-gray-500">{item}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                  className="flex flex-col sm:flex-row gap-3">
                  <Link to="/reveal/ORD-001" className="flex-1">
                    <motion.button whileHover={{ scale: 1.03 }} className="btn-primary w-full">
                      動画を受け取る（デモ）
                    </motion.button>
                  </Link>
                  <Link to="/mypage" className="flex-1">
                    <motion.button whileHover={{ scale: 1.03 }} className="btn-ghost w-full">
                      マイページへ
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step < 3 && step < 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            {step > 0 && (
              <button onClick={handleBack} className="btn-ghost flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                戻る
              </button>
            )}
            <motion.button onClick={handleNext}
              disabled={step === 0 && !form.occasion || step === 1 && !form.message}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none">
              次へ <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
