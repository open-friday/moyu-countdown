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

function getWeekdayKey(date: Date): string {
  return WEEKDAYS[date.getDay()]
}

function calcProgress(now: Date, startH: number, startM: number, endH: number, endM: number): number {
  const minuteOfDay = now.getHours() * 60 + now.getMinutes()
  const workStart = startH * 60 + startM
  const workEnd = endH * 60 + endM
  const workDuration = workEnd - workStart
  if (workDuration <= 0) return 0
  const elapsed = Math.min(Math.max(minuteOfDay - workStart, 0), workDuration)
  return Math.round((elapsed / workDuration) * 100)
}

export default function App() {
  const {
    now,
    dayType,
    holidayInfo,
    totalSeconds,
    isDone,
    countdownLabel,
    startHour,
    startMinute,
    targetHour,
    targetMinute,
    setWorkStartTarget,
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
    triggerFrenzyRefresh,
    handleBlankDoubleClick,
    handleCountdownPointerDown,
    handleCountdownPointerUp,
  } = useEasterEggs(now, targetHour, targetMinute)

  const weekday = getWeekdayKey(now)
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  const pct = calcProgress(now, startHour, startMinute, targetHour, targetMinute)
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
    <div
      className={styles.app}
      data-weekday={weekday}
      onDoubleClick={event => {
        const target = event.target as HTMLElement
        if (target.closest('button, input, select, textarea, a, [role="button"]')) return
        handleBlankDoubleClick()
      }}
    >
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

        {/* Flip countdown — long press 3s to trigger the PRD longpress egg */}
        <div
          onPointerDown={handleCountdownPointerDown}
          onPointerUp={handleCountdownPointerUp}
          onPointerLeave={handleCountdownPointerUp}
          onPointerCancel={handleCountdownPointerUp}
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
        <CopyDisplay now={now} onFrequentRefresh={triggerFrenzyRefresh} />

        <ProgressBar now={now} />

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
          startHour={startHour}
          startMinute={startMinute}
          targetHour={targetHour}
          targetMinute={targetMinute}
          onSave={(sh, sm, eh, em) => {
            setWorkStartTarget(sh, sm)
            setWorkEndTarget(eh, em)
          }}
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
