import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield } from 'lucide-react'

const SECTIONS = [
  {
    title: '第1条（収集する情報）',
    body: `本サービスでは、以下の情報を収集します。\n\n【アカウント情報】\n・Googleアカウントから取得する氏名・メールアドレス・プロフィール画像\n\n【利用情報】\n・リクエスト内容（メッセージ・シーン・受取人名）\n・注文履歴・決済情報（カード番号は当社サーバーに保存されません）\n\n【タレント情報】\n・プロフィール画像・ヘッダー画像・自己紹介文・動画\n\n【技術情報】\n・IPアドレス・ブラウザ種別・アクセス日時・クッキー情報`,
  },
  {
    title: '第2条（情報の利用目的）',
    body: `収集した情報は以下の目的で利用します。\n\n・本サービスの提供・運営・改善\n・ユーザー認証およびアカウント管理\n・リクエストの処理および動画の配信\n・タレントへの報酬支払い処理\n・カスタマーサポートへの対応\n・不正利用の検知・防止\n・サービスに関する重要なお知らせの送信\n・利用統計の集計（個人を特定しない形式）`,
  },
  {
    title: '第3条（第三者への提供）',
    body: `当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。\n\n・ユーザー本人の同意がある場合\n・法令に基づく場合（裁判所・行政機関からの要請等）\n・人の生命・身体・財産の保護のために必要な場合\n・業務委託先（決済処理・サーバー管理等）への提供（必要最小限の範囲）\n\n【利用する主な第三者サービス】\n・Stripe（決済処理） — https://stripe.com/jp/privacy\n・Supabase（データ管理） — https://supabase.com/privacy\n・Google OAuth（認証） — https://policies.google.com/privacy`,
  },
  {
    title: '第4条（データの保存と管理）',
    body: `・収集した個人情報はSupabase（クラウドデータベース）に保存されます\n・通信はSSL/TLS暗号化により保護されます\n・決済情報はStripeが管理し、当社のサーバーにはカード番号等のセンシティブ情報は保存されません\n・動画ファイルはSupabase Storageに保存され、アクセス制御により保護されます\n・不要になった個人情報は適切な方法で削除します`,
  },
  {
    title: '第5条（クッキーの使用）',
    body: `本サービスでは、ログイン状態の維持・サービス改善のためにlocalStorageおよびクッキーを使用します。ブラウザの設定によりクッキーを無効にすることが可能ですが、その場合一部機能が正常に動作しない場合があります。`,
  },
  {
    title: '第6条（未成年者のプライバシー）',
    body: `本サービスは13歳未満のお子様を対象としていません。13歳未満の方から意図せず個人情報を収集していることが判明した場合、速やかに削除いたします。`,
  },
  {
    title: '第7条（ユーザーの権利）',
    body: `ユーザーは以下の権利を有します。\n\n・保有する個人情報の開示請求\n・個人情報の訂正・削除の請求\n・個人情報の利用停止の請求\n\nご要望は下記のお問い合わせ先にご連絡ください。本人確認後、合理的な期間内に対応いたします。`,
  },
  {
    title: '第8条（データの保存期間）',
    body: `・アカウント情報：退会後1年間保存後に削除\n・注文・取引情報：法令上の要求に従い7年間保存\n・動画ファイル：ユーザーが削除を要請するか、サービス終了時に削除\n・ログ情報：取得から90日間保存後に削除`,
  },
  {
    title: '第9条（プライバシーポリシーの変更）',
    body: `本ポリシーは必要に応じて改定することがあります。重要な変更が生じた場合はサービス内でお知らせします。変更後も継続してご利用いただいた場合、変更後のポリシーに同意したものとみなします。`,
  },
  {
    title: '第10条（お問い合わせ）',
    body: `個人情報の取り扱いに関するご質問・ご要望は以下までご連絡ください。\n\nWowMe 個人情報保護担当\nメール：hello.wowme@gmail.com\n\n受付時間：平日 10:00〜18:00（土日祝除く）\n※お問い合わせ内容によっては回答までにお時間をいただく場合があります。`,
  },
]

export default function PrivacyModal({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #0080FF, #3399FF)' }}>
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-lg">プライバシーポリシー</h2>
                <p className="text-xs text-gray-400">最終更新: 2026年4月</p>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* 本文（スクロール） */}
          <div className="overflow-y-auto px-6 py-5 flex-1 space-y-6">
            <p className="text-xs text-gray-400 leading-relaxed bg-blue-50 rounded-2xl p-4 border border-blue-100">
              WowMe（以下「当社」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーでは、当社が収集する情報の種類・利用目的・管理方法についてご説明します。
            </p>

            {SECTIONS.map((section, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}>
                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0080FF, #3399FF)', fontSize: '10px' }}>
                    {i + 1}
                  </span>
                  {section.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line pl-7">
                  {section.body}
                </p>
              </motion.div>
            ))}

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mt-4">
              <p className="text-xs text-gray-400 text-center">
                お問い合わせ: <span className="font-medium text-gray-600">hello.wowme@gmail.com</span>
              </p>
            </div>
          </div>

          {/* フッター */}
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full py-3 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #0080FF, #3399FF)' }}>
              閉じる
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
