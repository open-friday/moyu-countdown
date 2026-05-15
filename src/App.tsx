import { useEffect, useState } from 'react'
import { CopyDisplay } from './components/CopyDisplay/CopyDisplay'
import { DayTypeBadge } from './components/DayTypeBadge/DayTypeBadge'
import { EasterEggCollection } from './components/EasterEggCollection/EasterEggCollection'
import { EasterEggOverlay } from './components/EasterEggOverlay/EasterEggOverlay'
import { FlipCountdown } from './components/FlipCountdown/FlipCountdown'
import { ProgressBar } from './components/ProgressBar/ProgressBar'
import { SettingsSheet } from './components/SettingsSheet/SettingsSheet'
import { ShareModal } from './components/ShareModal/ShareModal'
import { useCelebration } from './hooks/useCelebration'
import { useDayCountdown } from './hooks/useDayCountdown'
import { useEasterEggs } from './hooks/useEasterEggs'
import styles from './App.module.css'

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

const WEEKDAY_ACCENT: Record<string, string> = {
  sun: '#5B8DEF',
  mon: '#5B8DEF',
  tue: '#F49A4A',
  wed: '#5DD39E',
  thu: '#A786E5',
  fri: '#F4C25E',
  sat: '#5B8DEF',
}

const WORK_START = 9 * 60
const WORK_END = 18 * 60
const WORK_DURATION = WORK_END - WORK_START

function getWeekdayKey(date: Date): string {
  return WEEKDAYS[date.getDay()]
}

function calcProgress(now: Date): number {
  const minuteOfDay = now.getHours() * 60 + now.getMinutes()
  const elapsed = Math.min(Math.max(minuteOfDay - WORK_START, 0), WORK_DURATION)
  return Math.round((elapsed / WORK_DURATION) * 100)
}

export default function App() {
  const {
    now,
    dayType,
    holidayInfo,
    totalSeconds,
    isDone,
    countdownLabel,
    targetHour,
    targetMinute,
    setWorkEndTarget,
  } = useDayCountdown()
  const [showSettings, setShowSettings] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showCollection, setShowCollection] = useState(false)
  const { celebrate, reset } = useCelebration()
  const {
    activeEgg,
    allEggs,
    dismiss,
    replay,
    handleCountdownClick,
    handleProgressPointerDown,
    handleProgressPointerUp,
  } = useEasterEggs(now)

  const weekday = getWeekdayKey(now)
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  const pct = calcProgress(now)
  const accentColor = WEEKDAY_ACCENT[weekday] ?? '#5B8DEF'

  // Celebration only triggers when the work day is actually done
  const isWorkdayDone = isDone && dayType === 'workday'

  useEffect(() => {
    if (isWorkdayDone) {
      celebrate()
    } else {
      reset()
    }
  }, [isWorkdayDone, celebrate, reset])

  function handleReplayFromCollection(id: Parameters<typeof replay>[0]) {
    setShowCollection(false)
    replay(id)
  }

  return (
    <div className={styles.app} data-weekday={weekday}>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.pageHead}>
          <div className={styles.greeting}>
            摸鱼倒计时
            <span className={styles.date}>{dateStr}</span>
          </div>
          <button
            className={styles.iconBtn}
            aria-label="设置"
            onClick={() => setShowSettings(true)}
          >
            ⚙
          </button>
        </div>

        {/* Day type badge + dynamic countdown label */}
        <div className={styles.pillRow}>
          <DayTypeBadge dayType={dayType} holidayName={holidayInfo?.name} />
          <div className={styles.targetPill}>
            <span className={styles.dot} />
            {countdownLabel} 还有
          </div>
        </div>

        {/* Flip countdown — click 10× rapidly to trigger "发现摸鱼者" */}
        <div
          onClick={handleCountdownClick}
          style={{ cursor: 'default', userSelect: 'none' }}
          role="button"
          tabIndex={-1}
          aria-label="翻牌倒计时"
        >
          <FlipCountdown
            totalSeconds={totalSeconds}
            isOffWork={isWorkdayDone}
            showDays={dayType !== 'workday'}
          />
        </div>

        {/* 9-segment time copy */}
        <CopyDisplay now={now} />

        {/* Progress bar — long press 3s to trigger "时间加速幻觉" */}
        <div
          onPointerDown={handleProgressPointerDown}
          onPointerUp={handleProgressPointerUp}
          onPointerLeave={handleProgressPointerUp}
          onPointerCancel={handleProgressPointerUp}
          style={{ touchAction: 'none' }}
        >
          <ProgressBar now={now} />
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.collectionBtn}
            onClick={() => setShowCollection(true)}
            aria-label="彩蛋图鉴"
          >
            🎪 彩蛋图鉴
          </button>
          <span className={styles.footerHint}>点击 ⚙ 自定义下班时间</span>
          <button
            className={styles.shareBtn}
            onClick={() => setShowShare(true)}
            aria-label="分享摸鱼成绩"
          >
            📤 分享
          </button>
        </div>
      </div>

      {showSettings && (
        <SettingsSheet
          targetHour={targetHour}
          targetMinute={targetMinute}
          onSave={setWorkEndTarget}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showShare && (
        <ShareModal
          totalSeconds={totalSeconds}
          isOffWork={isWorkdayDone}
          pct={pct}
          dateStr={dateStr}
          weekday={weekday}
          accentColor={accentColor}
          onClose={() => setShowShare(false)}
        />
      )}

      {showCollection && (
        <EasterEggCollection
          eggs={allEggs}
          onClose={() => setShowCollection(false)}
          onReplay={handleReplayFromCollection}
        />
      )}

      {activeEgg && (
        <EasterEggOverlay eggId={activeEgg} onDismiss={dismiss} />
      )}
    </div>
  )
}
