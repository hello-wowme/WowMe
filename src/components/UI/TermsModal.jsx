import { motion, AnimatePresence } from 'framer-motion'
import { X, ScrollText } from 'lucide-react'

const TERMS = [
  {
    title: '第1条（サービスの概要）',
    body: `WowMe（以下「本サービス」）は、ファンがタレントに対してパーソナライズされた動画メッセージのリクエストを送ることができるプラットフォームです。本利用規約（以下「本規約」）は、本サービスを利用するすべてのユーザーに適用されます。`,
  },
  {
    title: '第2条（利用登録）',
    body: `本サービスの利用にはGoogleアカウントによるログインが必要です。登録情報は正確かつ最新の状態に保つものとします。未成年者が利用する場合は保護者の同意が必要です。`,
  },
  {
    title: '第3条（リクエストと支払い）',
    body: `ファンはタレントに対して動画メッセージのリクエストを送ることができます。リクエスト料金はタレントが設定した金額に基づきます。支払いはStripeを通じたクレジットカード決済にて行われます。支払い完了後のキャンセルは原則として承れませんが、タレントが動画を完成できない場合は全額返金いたします。`,
  },
  {
    title: '第4条（タレントの義務）',
    body: `タレントとして登録したユーザーは、リクエストを受領した場合、設定した返答時間内に誠実に対応するよう努めるものとします。不適切なコンテンツ・差別的表現・違法な内容を含む動画の投稿は禁止します。タレントへの収益は、運営手数料（レベルにより20〜40%）を差し引いた後に支払われます。`,
  },
  {
    title: '第5条（禁止事項）',
    body: `以下の行為を禁止します。\n・他のユーザーへの誹謗中傷・嫌がらせ\n・わいせつ・暴力的・差別的なコンテンツの送受信\n・本サービスを通じた詐欺・不正行為\n・著作権・肖像権など第三者の権利を侵害する行為\n・本サービスのシステムへの不正アクセスや妨害行為\n・営利目的の無断広告・スパム行為`,
  },
  {
    title: '第6条（コンテンツの権利）',
    body: `タレントが制作した動画の著作権はタレントに帰属します。ただし、本サービスの運営・改善・プロモーション目的での利用について、タレントは運営に対して非独占的なライセンスを付与するものとします。ファンは受け取った動画を個人的な用途（SNSシェアを含む）に限り使用できます。`,
  },
  {
    title: '第7条（プライバシー）',
    body: `当社は、ユーザーの個人情報を別途定めるプライバシーポリシーに従って適切に取り扱います。第三者へ無断で提供・販売することはありません。`,
  },
  {
    title: '第8条（免責事項）',
    body: `当社は、本サービスにおけるタレントとファン間のやり取りについて保証するものではありません。本サービスの利用により生じた損害について、当社の故意または重大な過失がある場合を除き、責任を負いません。`,
  },
  {
    title: '第9条（サービスの変更・停止）',
    body: `当社は、事前通知なく本サービスの内容を変更・停止することができます。変更後も継続してご利用いただいた場合、変更後の規約に同意したものとみなします。`,
  },
  {
    title: '第10条（規約の変更）',
    body: `本規約は必要に応じて改定することがあります。重要な変更の際はサービス内でお知らせします。最新の規約は常に本サービス上でご確認いただけます。`,
  },
  {
    title: '第11条（準拠法・管轄）',
    body: `本規約は日本法を準拠法とします。本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。`,
  },
]

export default function TermsModal({ onClose }) {
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
                style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
                <ScrollText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-lg">利用規約</h2>
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
            <p className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-2xl p-4 border border-gray-100">
              WowMe（以下「当社」）が提供する本サービスをご利用になる前に、以下の利用規約をよくお読みください。本サービスを利用することで、本規約に同意したものとみなされます。
            </p>

            {TERMS.map((section, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}>
                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)', fontSize: '10px' }}>
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
              style={{ background: 'linear-gradient(135deg, #FE3B8C, #0080FF)' }}>
              閉じる
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
