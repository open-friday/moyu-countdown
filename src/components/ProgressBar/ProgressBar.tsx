import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  now: Date
}

const WORK_START = 9 * 60   // 09:00 in minutes
const WORK_END = 18 * 60    // 18:00 in minutes
const WORK_DURATION = WORK_END - WORK_START

type Rank = { label: string; minPct: number }
const RANKS: Rank[] = [
  { label: '🐣 摸鱼见习', minPct: 0 },
  { label: '🐟 摸鱼新手', minPct: 15 },
  { label: '🐠 摸鱼中级', minPct: 30 },
  { label: '🐡 摸鱼高手', minPct: 50 },
  { label: '🦈 摸鱼大师', minPct: 70 },
  { label: '🐋 摸鱼传说', minPct: 90 },
]

function getRank(pct: number): string {
  let rank = RANKS[0].label
  for (const r of RANKS) {
    if (pct >= r.minPct) rank = r.label
  }
  return rank
}

export function ProgressBar({ now }: ProgressBarProps) {
  const minuteOfDay = now.getHours() * 60 + now.getMinutes()
  const elapsed = Math.min(Math.max(minuteOfDay - WORK_START, 0), WORK_DURATION)
  const pct = Math.round((elapsed / WORK_DURATION) * 100)
  const rank = getRank(pct)

  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <div className={styles.card}>
      <div className={styles.labelRow}>
        <span className={styles.title}>摸鱼当量</span>
        <span className={styles.pct}>{pct}%</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.meta}>
        <span className={styles.chip}>{rank}</span>
        <span className={styles.chip}>当前 {timeStr}</span>
        <span className={styles.chip}>工作日 09:00–18:00</span>
      </div>
    </div>
  )
}
