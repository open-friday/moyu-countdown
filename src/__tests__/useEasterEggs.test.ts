import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEasterEggs } from '../hooks/useEasterEggs'

// localStorage mock is provided by jsdom

describe('useEasterEggs', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  function makeDate(h: number, m: number, s: number): Date {
    const d = new Date('2024-01-15')
    d.setHours(h, m, s, 0)
    return d
  }

  // Safe "idle" time that doesn't trigger any time-based egg (s≠0 and m≠0)
  const IDLE = makeDate(10, 30, 5)

  it('starts with no active egg', () => {
    const { result } = renderHook(() => useEasterEggs(makeDate(10, 30, 5)))
    expect(result.current.activeEgg).toBeNull()
  })

  it('triggers time_noon at 12:00:00', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 59, 55) },
    })
    expect(result.current.activeEgg).toBeNull()

    rerender({ now: makeDate(12, 0, 0) })
    expect(result.current.activeEgg).toBe('time_noon')
  })

  it('triggers time_offwork at 18:00:00', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(17, 59, 55) },
    })
    rerender({ now: makeDate(18, 0, 0) })
    expect(result.current.activeEgg).toBe('time_offwork')
  })

  it('triggers time_fullhour at non-special full hours', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(10, 59, 55) },
    })
    rerender({ now: makeDate(11, 0, 0) })
    expect(result.current.activeEgg).toBe('time_fullhour')
  })

  it('does not trigger when seconds != 0', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 59, 59) },
    })
    rerender({ now: makeDate(12, 0, 1) })
    expect(result.current.activeEgg).toBeNull()
  })

  it('does not re-trigger the same minute key twice', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 59, 55) },
    })
    rerender({ now: makeDate(12, 0, 0) })
    expect(result.current.activeEgg).toBe('time_noon')

    act(() => result.current.dismiss())
    // Same key again — should not re-trigger
    rerender({ now: makeDate(12, 0, 0) })
    expect(result.current.activeEgg).toBeNull()
  })

  it('dismiss clears active egg', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 59, 55) },
    })
    rerender({ now: makeDate(12, 0, 0) })
    expect(result.current.activeEgg).toBe('time_noon')

    act(() => result.current.dismiss())
    expect(result.current.activeEgg).toBeNull()
  })

  it('replay sets active egg without changing unlocked state', () => {
    const now = IDLE
    const { result } = renderHook(() => useEasterEggs(now))
    act(() => result.current.replay('behavior_fish'))
    expect(result.current.activeEgg).toBe('behavior_fish')
  })

  it('unlocks egg and persists to localStorage on trigger', () => {
    const { result, rerender } = renderHook(({ now }) => useEasterEggs(now), {
      initialProps: { now: makeDate(11, 59, 55) },
    })
    rerender({ now: makeDate(12, 0, 0) })

    expect(result.current.unlockedIds.has('time_noon')).toBe(true)
    const stored = JSON.parse(localStorage.getItem('moyu_unlocked_eggs') ?? '[]')
    expect(stored).toContain('time_noon')
  })

  it('loads unlocked state from localStorage on init', () => {
    localStorage.setItem('moyu_unlocked_eggs', JSON.stringify(['behavior_fish', 'time_noon']))
    const { result } = renderHook(() => useEasterEggs(IDLE))
    expect(result.current.unlockedIds.has('behavior_fish')).toBe(true)
    expect(result.current.unlockedIds.has('time_noon')).toBe(true)
  })

  it('allEggs reflects unlocked state', () => {
    localStorage.setItem('moyu_unlocked_eggs', JSON.stringify(['time_offwork']))
    const { result } = renderHook(() => useEasterEggs(IDLE))
    const offwork = result.current.allEggs.find(e => e.def.id === 'time_offwork')
    const noon = result.current.allEggs.find(e => e.def.id === 'time_noon')
    expect(offwork?.unlocked).toBe(true)
    expect(noon?.unlocked).toBe(false)
  })

  it('handleCountdownClick triggers behavior_fish after 10 rapid clicks', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.handleCountdownClick()
      }
    })
    expect(result.current.activeEgg).toBe('behavior_fish')
  })

  it('handleCountdownClick does not trigger on fewer than 10 clicks', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))
    act(() => {
      for (let i = 0; i < 9; i++) {
        result.current.handleCountdownClick()
      }
    })
    expect(result.current.activeEgg).toBeNull()
  })

  it('handleCountdownClick resets counter after trigger', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))
    act(() => {
      for (let i = 0; i < 10; i++) result.current.handleCountdownClick()
    })
    expect(result.current.activeEgg).toBe('behavior_fish')
    act(() => result.current.dismiss())

    // Should need 10 more clicks
    act(() => {
      for (let i = 0; i < 9; i++) result.current.handleCountdownClick()
    })
    expect(result.current.activeEgg).toBeNull()
  })

  it('handleProgressPointerDown triggers behavior_warp after 3s', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))
    act(() => result.current.handleProgressPointerDown())
    expect(result.current.activeEgg).toBeNull()

    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.activeEgg).toBe('behavior_warp')
  })

  it('handleProgressPointerUp cancels the long press', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))
    act(() => result.current.handleProgressPointerDown())
    act(() => result.current.handleProgressPointerUp())
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.activeEgg).toBeNull()
  })

  it('allEggs returns all 5 egg definitions', () => {
    const { result } = renderHook(() => useEasterEggs(IDLE))
    expect(result.current.allEggs).toHaveLength(5)
  })
})
