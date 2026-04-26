/**
 * WowMe ロゴコンポーネント
 * ピンクの吹き出し＋ビックリマーク ＋ WowMe テキスト
 * size prop で高さ基準のスケーリング
 */
export default function WowMeLogo({ height = 36, className = '' }) {
  // アスペクト比を維持（元画像比率 約 3.2:1）
  const width = Math.round(height * 3.2)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 100"
      width={width}
      height={height}
      className={className}
      aria-label="WowMe"
    >
      {/* ── 吹き出しアイコン ── */}
      {/* 円 */}
      <circle cx="50" cy="44" r="38" fill="#FE3B8C" />
      {/* 吹き出しのしっぽ */}
      <polygon points="28,76 18,95 50,76" fill="#FE3B8C" />

      {/* ビックリマーク（白） */}
      {/* 上のバー */}
      <rect x="43" y="22" width="14" height="30" rx="7" fill="white" />
      {/* 下のドット */}
      <circle cx="50" cy="64" r="7" fill="white" />

      {/* ── WowMe テキスト ── */}
      <text
        x="102"
        y="72"
        fontFamily='"Noto Sans JP", "Hiragino Sans", Arial, sans-serif'
        fontWeight="900"
        fontSize="62"
        letterSpacing="-1"
      >
        <tspan fill="#FE3B8C">Wow</tspan><tspan fill="#0080FF">Me</tspan>
      </text>
    </svg>
  )
}
