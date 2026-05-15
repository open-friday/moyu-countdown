import { useCallback, useEffect, useRef, useState } from 'react'
import { EGG_DEFS } from '../constants/easterEggDefs'
import type { EasterEggId, EasterEggItem } from '../types/easterEgg'

const STORAGE_KEY = 'moyu_unlocked_eggs'

function loadUnlocked(): Set<EasterEggId> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return new Set()
    return new Set(JSON.parse(stored) as EasterEggId[])
  } catch {
    return new Set()
  }
}

function saveUnlocked(ids: Set<EasterEggId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {}
}

export function useEasterEggs(now: Date) {
  const [activeEgg, setActiveEgg] = useState<EasterEggId | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<Set<EasterEggId>>(loadUnlocked)

  const lastTimeTriggerKey = useRef('')
  const clickTimestamps = useRef<number[]>([])
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trigger = useCallback((id: EasterEggId) => {
    setUnlockedIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveUnlocked(next)
      return next
    })
    setActiveEgg(id)
  }, [])

  const dismiss = useCallback(() => setActiveEgg(null), [])

  const replay = useCallback((id: EasterEggId) => setActiveEgg(id), [])

  // Time-triggered Easter eggs: fire at the top of each minute
  useEffect(() => {
    const h = now.getHours()
    const m = now.getMinutes()
    const s = now.getSeconds()
    if (s !== 0) return

    const key = `${h}:${m}`
    if (lastTimeTriggerKey.current === key) return
    lastTimeTriggerKey.current = key

    if (h === 12 && m === 0) {
      trigger('time_noon')
    } else if (h === 18 && m === 0) {
      trigger('time_offwork')
    } else if (m === 0) {
      trigger('time_fullhour')
    }
  }, [now, trigger])

  // Behavior: 10 rapid clicks on countdown area within 3 seconds
  const handleCountdownClick = useCallback(() => {
    const ts = Date.now()
    clickTimestamps.current = clickTimestamps.current.filter(t => ts - t < 3000)
    clickTimestamps.current.push(ts)
    if (clickTimestamps.current.length >= 10) {
      clickTimestamps.current = []
      trigger('behavior_fish')
    }
  }, [trigger])

  // Behavior: 3-second long press on progress bar
  const handleProgressPointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => trigger('behavior_warp'), 3000)
  }, [trigger])

  const handleProgressPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }
  }, [])

  const allEggs: EasterEggItem[] = EGG_DEFS.map(def => ({
    def,
    unlocked: unlockedIds.has(def.id),
  }))

  return {
    activeEgg,
    unlockedIds,
    allEggs,
    dismiss,
    replay,
    handleCountdownClick,
    handleProgressPointerDown,
    handleProgressPointerUp,
  }
}
