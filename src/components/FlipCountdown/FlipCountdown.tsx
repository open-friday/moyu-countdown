import { FlipCard } from '../FlipCard/FlipCard'
import styles from './FlipCountdown.module.css'

interface FlipCountdownProps {
  totalSeconds: number
  isOffWork: boolean
  showDays?: boolean // when true, show d:hh:mm for multi-day countdowns
}

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0')
}

export function FlipCountdown({ totalSeconds, isOffWork, showDays }: FlipCountdownProps) {
  if (isOffWork) {
    return (
      <div className={styles.offwork}>
        <div className={styles.offworkEmoji}>🎉</div>
        <div className={styles.offworkText}>已下班</div>
      </div>
    )
  }

  // Multi-day mode: show days + hours + minutes (skip seconds for readability)
  if (showDays && totalSeconds >= 86400) {
    const days = Math.floor(totalSeconds / 86400)
    const rem = totalSeconds % 86400
    const h = Math.floor(rem / 3600)
    const m = Math.floor((rem % 3600) / 60)

    const dd = pad(days)
    const hh = pad(h)
    const mm = pad(m)

    return (
      <div>
        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <div className={styles.group}>
              <FlipCard digit={dd[0]} />
              <FlipCard digit={dd[1]} />
            </div>
            <div className={styles.label}>
              <span className={styles.labelText}>天</span>
            </div>
          </div>

          <div className={styles.sep}>:</div>

          <div className={styles.labelGroup}>
            <div className={styles.group}>
              <FlipCard digit={hh[0]} />
              <FlipCard digit={hh[1]} />
            </div>
            <div className={styles.label}>
              <span className={styles.labelText}>时</span>
            </div>
          </div>

          <div className={styles.sep}>:</div>

          <div className={styles.labelGroup}>
            <div className={styles.group}>
              <FlipCard digit={mm[0]} />
              <FlipCard digit={mm[1]} />
            </div>
            <div className={styles.label}>
              <span className={styles.labelText}>分</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const hh = pad(h)
  const mm = pad(m)
  const ss = pad(s)

  return (
    <div>
      <div className={styles.row}>
        <div className={styles.labelGroup}>
          <div className={styles.group}>
            <FlipCard digit={hh[0]} />
            <FlipCard digit={hh[1]} />
          </div>
          <div className={styles.label}>
            <span className={styles.labelText}>时</span>
          </div>
        </div>

        <div className={styles.sep}>:</div>

        <div className={styles.labelGroup}>
          <div className={styles.group}>
            <FlipCard digit={mm[0]} />
            <FlipCard digit={mm[1]} />
          </div>
          <div className={styles.label}>
            <span className={styles.labelText}>分</span>
          </div>
        </div>

        <div className={styles.sep}>:</div>

        <div className={styles.labelGroup}>
          <div className={styles.group}>
            <FlipCard digit={ss[0]} />
            <FlipCard digit={ss[1]} />
          </div>
          <div className={styles.label}>
            <span className={styles.labelText}>秒</span>
          </div>
        </div>
      </div>
    </div>
  )
}
