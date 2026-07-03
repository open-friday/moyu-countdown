import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEasterEggs } from '../hooks/useEasterEggs'

describe('useEasterEggs', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-03T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    sessionStorage.clear()
  })

  function makeDate(h: number, m: number, s: number, date = '2026-07-02'): Date {
    const d = new Date(date)
    d.setHours(h, m, s, 0)
    return d
  }

  const IDLE = makeDate(10, 30, 5)

  it('starts with no active egg', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))
    expect(result.current.activeEgg).toBeNull()
  })

  it('triggers lunch signal at 11:30:00', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 29, 55) },
    })

    rerender({ now: makeDate(11, 30, 0) })
    expect(result.current.activeEgg).toBe('egg_lunch_signal')
  })

  it('triggers friday confetti at Friday 15:00:00', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(14, 59, 55, '2026-07-03') },
    })

    rerender({ now: makeDate(15, 0, 0, '2026-07-03') })
    expect(result.current.activeEgg).toBe('egg_friday_confetti')
  })

  it('triggers hour flash at non-special full hours', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(9, 59, 55) },
    })

    rerender({ now: makeDate(10, 0, 0) })
    expect(result.current.activeEgg).toBe('egg_hour_flash')
  })

  it('triggers midnight at 00:00:00', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(23, 59, 55) },
    })

    rerender({ now: makeDate(0, 0, 0, '2026-07-03') })
    expect(result.current.activeEgg).toBe('egg_midnight')
  })

  it('triggers overtime after work end plus two hours', () => {
    const { result } = renderHook(() => useEasterEggs(makeDate(20, 0, 1), 18, 0))
    expect(result.current.activeEgg).toBe('egg_overtime')
  })

  it('does not trigger time eggs when seconds do not match a trigger', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 29, 59) },
    })

    rerender({ now: makeDate(11, 30, 1) })
    expect(result.current.activeEgg).toBeNull()
  })

  it('does not re-trigger the same egg in one session', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 29, 55) },
    })

    rerender({ now: makeDate(11, 30, 0) })
    expect(result.current.activeEgg).toBe('egg_lunch_signal')

    act(() => result.current.dismiss())
    rerender({ now: makeDate(11, 30, 0) })
    expect(result.current.activeEgg).toBeNull()
  })

  it('dismiss clears active egg', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 29, 55) },
    })

    rerender({ now: makeDate(11, 30, 0) })
    act(() => result.current.dismiss())
    expect(result.current.activeEgg).toBeNull()
  })

  it('replay sets active egg without changing unlocked state', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))
    act(() => result.current.replay('egg_frenzy_refresh'))
    expect(result.current.activeEgg).toBe('egg_frenzy_refresh')
    expect(result.current.unlockedIds.has('egg_frenzy_refresh')).toBe(false)
  })

  it('unlocks egg and persists to egg_gallery on trigger', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 29, 55) },
    })

    rerender({ now: makeDate(11, 30, 0) })

    expect(result.current.unlockedIds.has('egg_lunch_signal')).toBe(true)
    const stored = JSON.parse(localStorage.getItem('egg_gallery') ?? '{}')
    expect(Object.keys(stored)).toHaveLength(8)
    expect(stored.egg_lunch_signal.unlocked).toBe(true)
    expect(stored.egg_friday_confetti.unlocked).toBe(false)
    expect(stored.egg_lunch_signal.firstUnlockedAt).toBeTruthy()
  })

  it('loads unlocked state from egg_gallery on init', () => {
    localStorage.setItem('egg_gallery', JSON.stringify({
      egg_lunch_signal: { unlocked: true, firstUnlockedAt: '2026-07-03T00:00:00.000Z' },
      egg_frenzy_refresh: { unlocked: true },
    }))

    const { result } = renderHook(() => useEasterEggs(IDLE))
    expect(result.current.unlockedIds.has('egg_lunch_signal')).toBe(true)
    expect(result.current.unlockedIds.has('egg_frenzy_refresh')).toBe(true)
  })

  it('maps legacy unlocked ids into the new gallery contract', () => {
    localStorage.setItem('moyu_unlocked_eggs', JSON.stringify(['time_noon', 'time_offwork', 'time_fullhour', 'behavior_warp']))

    const { result } = renderHook(() => useEasterEggs(IDLE))
    expect(result.current.unlockedIds.has('egg_lunch_signal')).toBe(true)
    expect(result.current.unlockedIds.has('egg_overtime')).toBe(true)
    expect(result.current.unlockedIds.has('egg_hour_flash')).toBe(true)
    expect(result.current.unlockedIds.has('egg_longpress')).toBe(true)
  })

  it('allEggs reflects unlocked state and all 8 definitions', () => {
    localStorage.setItem('egg_gallery', JSON.stringify({
      egg_overtime: { unlocked: true },
    }))

    const { result } = renderHook(() => useEasterEggs(IDLE))
    expect(result.current.allEggs).toHaveLength(8)
    expect(result.current.allEggs.find(e => e.def.id === 'egg_overtime')?.unlocked).toBe(true)
    expect(result.current.allEggs.find(e => e.def.id === 'egg_lunch_signal')?.unlocked).toBe(false)
  })

  it('handleBlankDoubleClick triggers the double tap blank egg', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))

    act(() => result.current.handleBlankDoubleClick())
    expect(result.current.activeEgg).toBe('egg_doubletap_blank')
  })

  it('triggerFrenzyRefresh triggers the high frequency refresh egg', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))

    act(() => result.current.triggerFrenzyRefresh())
    expect(result.current.activeEgg).toBe('egg_frenzy_refresh')
  })

  it('handleCountdownPointerDown triggers longpress after 3s', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))

    act(() => result.current.handleCountdownPointerDown())
    expect(result.current.activeEgg).toBeNull()

    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.activeEgg).toBe('egg_longpress')
  })

  it('handleCountdownPointerUp cancels the long press', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))

    act(() => result.current.handleCountdownPointerDown())
    act(() => result.current.handleCountdownPointerUp())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.activeEgg).toBeNull()
  })
})
