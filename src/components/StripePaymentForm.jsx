import { useState } from 'react'
import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Lock } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const ELEMENT_OPTIONS = {
  appearance: {
    theme: 'flat',
    variables: {
      colorPrimary: '#FE3B8C',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: '"Noto Sans JP", "Helvetica Neue", sans-serif',
      borderRadius: '12px',
      spacingUnit: '4px',
    },
    rules: {
      '.Input': {
        border: '2px solid #F0F0F5',
        padding: '12px 16px',
        fontSize: '15px',
      },
      '.Input:focus': {
        border: '2px solid #FE3B8C',
        boxShadow: '0 0 0 3px rgba(254,59,140,0.08)',
      },
      '.Label': {
        fontWeight: '500',
        color: '#6B7280',
        fontSize: '13px',
        marginBottom: '6px',
      },
      '.Tab': {
        border: '2px solid #F0F0F5',
        borderRadius: '12px',
      },
      '.Tab--selected': {
        borderColor: '#FE3B8C',
        background: 'linear-gradient(135deg, #fff0f6, #f0f6ff)',
      },
    },
  },
}

function CheckoutForm({ amount, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMsg('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/#/payment-complete`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMsg(error.message || '決済に失敗しました。もう一度お試しください。')
      onError?.(error)
      setIsProcessing(false)
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="w-4 h-4 text-green-500" />
        <span className="text-sm text-gray-400">SSL暗号化で安全に決済（Stripe）</span>
      </div>

      <PaymentElement />

      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          ⚠️ {errorMsg}
        </motion.div>
      )}

      <motion.button type="submit" disabled={!stripe || isProcessing}
        whileHover={!isProcessing ? { scale: 1.02 } : {}}
        whileTap={!isProcessing ? { scale: 0.97 } : {}}
        className="btn-primary w-full flex items-center justify-center gap-3 text-base py-5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none">
        {isProcessing ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            処理中...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            ¥{amount.toLocaleString()} を支払う
          </>
        )}
      </motion.button>

      <p className="text-xs text-center text-gray-300">
        Stripeの安全な決済システムを使用しています
      </p>
    </form>
  )
}

export default function StripePaymentForm({ amount, metadata, onSuccess, onError, disabled = false }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initError, setInitError] = useState('')

  const initPayment = async () => {
    setLoading(true)
    setInitError('')
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, metadata }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setClientSecret(data.clientSecret)
    } catch (err) {
      setInitError('決済の初期化に失敗しました。しばらく経ってからお試しください。')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-400">SSL暗号化で安全に決済（Stripe）</span>
        </div>
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">決済フォームを読み込みます</p>
          {initError && (
            <p className="text-sm text-red-500 mb-3">⚠️ {initError}</p>
          )}
          <motion.button onClick={initPayment} disabled={loading || disabled}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                読み込み中...
              </>
            ) : (
              <><Lock className="w-4 h-4" />決済フォームを開く</>
            )}
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, ...ELEMENT_OPTIONS }}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
