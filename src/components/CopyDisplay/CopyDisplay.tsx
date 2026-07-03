import { useCallback, useEffect, useRef, useState } from 'react'
import { getRandomMessage, getSegmentLabel } from '../../data/copyEngine'
import styles from './CopyDisplay.module.css'

const REFRESH_WINDOW_MS = 10_000
const REFRESH_THRESHOLD = 3
const REFRESH_COOLDOWN_MS = 30_000
const REFRESH_HITS_KEY = 'moyu_refresh_hits'
const REFRESH_COOLDOWN_KEY = 'moyu_refresh_cooldown_until'
const REFRESH_LOCKED_COPY_KEY = 'moyu_refresh_locked_copy'
const FREQUENT_MESSAGES = [
  '急什么，秒针很努力了。',
  '别刷新了，时间不会因为你急就加速。',
  '你已经把倒计时盯到有点紧张了。',
]

interface CopyDisplayProps {
  now: Date
  onFrequentRefresh?: () => void
}

function readNumber(key: string): number {
  const value = sessionStorage.getItem(key)
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function readHits(): number[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(REFRESH_HITS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is number => typeof item === 'number') : []
  } catch {
    return []
  }
}

function getLockedFrequentMessage(): string {
  const stored = sessionStorage.getItem(REFRESH_LOCKED_COPY_KEY)
  if (stored) return stored
  const next = FREQUENT_MESSAGES[0]
  sessionStorage.setItem(REFRESH_LOCKED_COPY_KEY, next)
  return next
}

function clearRefreshCooldown() {
  sessionStorage.removeItem(REFRESH_COOLDOWN_KEY)
  sessionStorage.removeItem(REFRESH_LOCKED_COPY_KEY)
  sessionStorage.removeItem(REFRESH_HITS_KEY)
}

function isCoolingDownUntil(cooldownUntil: number, ts = Date.now()) {
  return ts < cooldownUntil
}

export function CopyDisplay({ now, onFrequentRefresh }: CopyDisplayProps) {
  const hour = now.getHours()
  const label = getSegmentLabel(hour)

  const [cooldownUntil, setCooldownUntil] = useState(() => readNumber(REFRESH_COOLDOWN_KEY))
  const [message, setMessage] = useState(() => (
    Date.now() < readNumber(REFRESH_COOLDOWN_KEY) ? getLockedFrequentMessage() : getRandomMessage(hour)
  ))
  const prevLabelRef = useRef(label)
  const refreshMessageRef = useRef<() => void>(() => undefined)

  const refreshMessage = useCallback(() => {
    const ts = Date.now()

    if (isCoolingDownUntil(cooldownUntil, ts)) {
      setMessage(getLockedFrequentMessage())
      return
    }

    const hits = readHits().filter(hit => ts - hit <= REFRESH_WINDOW_MS)
    hits.push(ts)
    sessionStorage.setItem(REFRESH_HITS_KEY, JSON.stringify(hits))

    if (hits.length >= REFRESH_THRESHOLD) {
      const until = ts + REFRESH_COOLDOWN_MS
      sessionStorage.setItem(REFRESH_COOLDOWN_KEY, String(until))
      setCooldownUntil(until)
      setMessage(getLockedFrequentMessage())
      onFrequentRefresh?.()
      return
    }

    setMessage(getRandomMessage(hour))
  }, [cooldownUntil, hour, onFrequentRefresh])

  useEffect(() => {
    if (prevLabelRef.current !== label) {
      prevLabelRef.current = label
      setMessage(isCoolingDownUntil(cooldownUntil) ? getLockedFrequentMessage() : getRandomMessage(hour))
    }
  }, [label, hour, cooldownUntil])

  useEffect(() => {
    if (!isCoolingDownUntil(cooldownUntil)) {
      if (cooldownUntil > 0) clearRefreshCooldown()
      return
    }

    const timeoutId = window.setTimeout(() => {
      clearRefreshCooldown()
      setCooldownUntil(0)
      setMessage(getRandomMessage(hour))
    }, cooldownUntil - Date.now())

    return () => window.clearTimeout(timeoutId)
  }, [cooldownUntil, hour])

  useEffect(() => {
    refreshMessageRef.current = refreshMessage
  }, [refreshMessage])

  useEffect(() => {
    function handleVisible() {
      if (!document.hidden) refreshMessageRef.current()
    }

    const timeoutId = window.setTimeout(() => refreshMessageRef.current(), 0)
    document.addEventListener('visibilitychange', handleVisible)
    return () => {
      window.clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [])

  return (
    <div className={styles.card} data-testid="copy-display">
      <div className={styles.head}>
        <span className={styles.segLabel}>{label}</span>
        <button className={styles.refreshBtn} type="button" onClick={refreshMessage}>
          刷新文案
        </button>
      </div>
      <span className={styles.message}>{message}</span>
    </div>
  )
}
