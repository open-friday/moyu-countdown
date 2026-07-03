import { useCallback, useEffect, useRef, useState } from 'react'
import { EGG_DEFS } from '../constants/easterEggDefs'
import type { EasterEggId, EasterEggItem } from '../types/easterEgg'

const GALLERY_STORAGE_KEY = 'egg_gallery'
const LEGACY_UNLOCKED_KEY = 'moyu_unlocked_eggs'
const SESSION_FIRED_KEY = 'egg_fired_this_session'

interface GalleryEntry {
  unlocked: boolean
  firstUnlockedAt?: string
}

type GalleryState = Partial<Record<EasterEggId, GalleryEntry>>

const LEGACY_ID_MAP: Partial<Record<string, EasterEggId>> = {
  time_noon: 'egg_lunch_signal',
  time_offwork: 'egg_overtime',
  time_fullhour: 'egg_hour_flash',
  behavior_fish: 'egg_frenzy_refresh',
  behavior_warp: 'egg_longpress',
}

const memoryFired = new Set<EasterEggId>()

function emptyGallery(): GalleryState {
  return {}
}

function normalizeGallery(value: unknown): GalleryState {
  if (!value || typeof value !== 'object') return emptyGallery()
  const knownIds = new Set(EGG_DEFS.map(def => def.id))
  return Object.entries(value as Record<string, GalleryEntry>).reduce<GalleryState>((acc, [id, entry]) => {
    if (knownIds.has(id as EasterEggId) && entry?.unlocked) {
      acc[id as EasterEggId] = {
        unlocked: true,
        firstUnlockedAt: typeof entry.firstUnlockedAt === 'string' ? entry.firstUnlockedAt : undefined,
      }
    }
    return acc
  }, {})
}

function loadGallery(): GalleryState {
  try {
    const stored = localStorage.getItem(GALLERY_STORAGE_KEY)
    const gallery = stored ? normalizeGallery(JSON.parse(stored)) : emptyGallery()
    const legacy = JSON.parse(localStorage.getItem(LEGACY_UNLOCKED_KEY) || '[]') as string[]

    if (Array.isArray(legacy)) {
      legacy.forEach(id => {
        const mappedId = LEGACY_ID_MAP[id] ?? (EGG_DEFS.some(def => def.id === id) ? id as EasterEggId : undefined)
        if (mappedId && !gallery[mappedId]) {
          gallery[mappedId] = { unlocked: true }
        }
      })
    }

    return gallery
  } catch {
    return emptyGallery()
  }
}

function saveGallery(gallery: GalleryState) {
  try {
    const completeGallery = EGG_DEFS.reduce<Record<EasterEggId, GalleryEntry>>((acc, def) => {
      acc[def.id] = gallery[def.id] ?? { unlocked: false }
      return acc
    }, {} as Record<EasterEggId, GalleryEntry>)
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(completeGallery))
  } catch {}
}

function loadFiredThisSession(): Set<EasterEggId> {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SESSION_FIRED_KEY) || '[]') as string[]
    if (!Array.isArray(parsed)) return new Set(memoryFired)
    const knownIds = new Set(EGG_DEFS.map(def => def.id))
    return new Set(parsed.filter((id): id is EasterEggId => knownIds.has(id as EasterEggId)))
  } catch {
    return new Set(memoryFired)
  }
}

function saveFiredThisSession(ids: Set<EasterEggId>) {
  memoryFired.clear()
  ids.forEach(id => memoryFired.add(id))
  try {
    sessionStorage.setItem(SESSION_FIRED_KEY, JSON.stringify([...ids]))
  } catch {}
}

export function useEasterEggs(now: Date, workEndHour = 18, workEndMinute = 0) {
  const [activeEgg, setActiveEgg] = useState<EasterEggId | null>(null)
  const [gallery, setGallery] = useState<GalleryState>(loadGallery)

  const lastTimeTriggerKey = useRef('')
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trigger = useCallback((id: EasterEggId) => {
    const fired = loadFiredThisSession()
    if (fired.has(id)) return
    fired.add(id)
    saveFiredThisSession(fired)

    setGallery(prev => {
      const next = {
        ...prev,
        [id]: prev[id]?.unlocked
          ? prev[id]
          : { unlocked: true, firstUnlockedAt: new Date().toISOString() },
      }
      saveGallery(next)
      return next
    })
    setActiveEgg(id)
  }, [])

  const dismiss = useCallback(() => setActiveEgg(null), [])

  const replay = useCallback((id: EasterEggId) => setActiveEgg(id), [])

  // Time-triggered Easter eggs.
  useEffect(() => {
    const h = now.getHours()
    const m = now.getMinutes()
    const s = now.getSeconds()

    const key = `${now.toDateString()}:${h}:${m}:${s}`
    if (lastTimeTriggerKey.current === key) return
    lastTimeTriggerKey.current = key

    if (s === 0 && h === 11 && m === 30) {
      trigger('egg_lunch_signal')
    } else if (s === 0 && now.getDay() === 5 && h === 15 && m === 0) {
      trigger('egg_friday_confetti')
    } else if (s === 0 && h === 0 && m === 0) {
      trigger('egg_midnight')
    } else if (s === 0 && m === 0) {
      trigger('egg_hour_flash')
    } else {
      const workEnd = new Date(now)
      workEnd.setHours(workEndHour, workEndMinute, 0, 0)
      if (now.getTime() >= workEnd.getTime() + 2 * 60 * 60 * 1000) {
        trigger('egg_overtime')
      }
    }
  }, [now, trigger, workEndHour, workEndMinute])

  const handleBlankDoubleClick = useCallback(() => {
    trigger('egg_doubletap_blank')
  }, [trigger])

  const handleCountdownPointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => trigger('egg_longpress'), 3000)
  }, [trigger])

  const handleCountdownPointerUp = useCallback(() => {
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
    unlocked: Boolean(gallery[def.id]?.unlocked),
    firstUnlockedAt: gallery[def.id]?.firstUnlockedAt,
  }))

  const unlockedIds = new Set(EGG_DEFS.filter(def => gallery[def.id]?.unlocked).map(def => def.id))

  return {
    activeEgg,
    unlockedIds,
    allEggs,
    dismiss,
    replay,
    triggerFrenzyRefresh: () => trigger('egg_frenzy_refresh'),
    handleBlankDoubleClick,
    handleCountdownPointerDown,
    handleCountdownPointerUp,
  }
}
