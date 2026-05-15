import { forwardRef } from 'react'
import styles from './ShareCard.module.css'

const RANKS = [
  { label: '🐣 摸鱼见习', minPct: 0 },
  { label: '🐟 摸鱼新手', minPct: 15 },
  { label: '🐠 摸鱼中级', minPct: 30 },
  { label: '🐡 摸鱼高手', minPct: 50 },
  { label: '🦈 摸鱼大师', minPct: 70 },
  { label: '🐋 摸鱼传说', minPct: 90 },
]

const QUOTES = [
  { minPct: 0, text: '刚开始，摸鱼计划已就绪。' },
  { minPct: 15, text: '咖啡续命中，假装在认真看文档。' },
  { minPct: 30, text: '午饭后的困意，是摸鱼的最佳借口。' },
  { minPct: 50, text: '下午茶时间到，继续摸。' },
  { minPct: 70, text: '胜利就在眼前，再坚持一下。' },
  { minPct: 90, text: '最后的修罗场，挺住打工人。' },
]

function getRank(pct: number): string {
  let rank = RANKS[0].label
  for (const r of RANKS) {
    if (pct >= r.minPct) rank = r.label
  }
  return rank
}

function getQuote(pct: number, isOffWork: boolean): string {
  if (isOffWork) return '今天的鱼，已经摸完了！'
  let quote = QUOTES[0].text
  for (const q of QUOTES) {
    if (pct >= q.minPct) quote = q.text
  }
  return quote
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export interface ShareCardProps {
  totalSeconds: number
  isOffWork: boolean
  pct: number
  dateStr: string
  weekday: string
  accentColor: string
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ totalSeconds, isOffWork, pct, dateStr, weekday, accentColor }, ref) => {
    const rank = getRank(pct)
    const quote = getQuote(pct, isOffWork)
    const timeDisplay = isOffWork ? '已下班 🎉' : formatTime(totalSeconds)

    return (
      <div
        ref={ref}
        className={styles.card}
        data-weekday={weekday}
        style={{ background: `linear-gradient(180deg, ${accentColor} 0%, #0A0C10 100%)` }}
      >
        <div className={styles.overlay} />
        <div className={styles.top}>
          <div className={styles.brand}>摸鱼倒计时 · MOYU</div>
          <div className={styles.headLine}>距 下班 还有</div>
          <div className={styles.bigNum}>{timeDisplay}</div>
          <div className={styles.smallNum}>摸鱼当量 {pct}%</div>
        </div>
        <div className={styles.quote}>{quote}</div>
        <div className={styles.footer}>
          <span>{dateStr}</span>
          <span className={styles.rank}>{rank}</span>
          <span>moyu.app</span>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = 'ShareCard'
