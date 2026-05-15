import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from '../hooks/useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns positive seconds before target time', () => {
    // Set current time to 17:00:00
    vi.setSystemTime(new Date('2024-01-15T17:00:00'))
    const { result } = renderHook(() => useCountdown(18, 0))
    expect(result.current.totalSeconds).toBe(3600)
    expect(result.current.isOffWork).toBe(false)
  })

  it('returns zero seconds and isOffWork when past target', () => {
    vi.setSystemTime(new Date('2024-01-15T18:30:00'))
    const { result } = renderHook(() => useCountdown(18, 0))
    expect(result.current.totalSeconds).toBe(0)
    expect(result.current.isOffWork).toBe(true)
  })

  it('returns exactly zero at target moment', () => {
    vi.setSystemTime(new Date('2024-01-15T18:00:00'))
    const { result } = renderHook(() => useCountdown(18, 0))
    expect(result.current.totalSeconds).toBe(0)
    expect(result.current.isOffWork).toBe(true)
  })

  it('updates every second', () => {
    vi.setSystemTime(new Date('2024-01-15T17:59:58'))
    const { result } = renderHook(() => useCountdown(18, 0))
    expect(result.current.totalSeconds).toBe(2)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.totalSeconds).toBe(1)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.totalSeconds).toBe(0)
    expect(result.current.isOffWork).toBe(true)
  })

  it('allows changing target time via setTarget', () => {
    vi.setSystemTime(new Date('2024-01-15T17:00:00'))
    const { result } = renderHook(() => useCountdown(18, 0))
    expect(result.current.totalSeconds).toBe(3600)

    act(() => { result.current.setTarget(17, 30) })
    expect(result.current.totalSeconds).toBe(1800)
    expect(result.current.isOffWork).toBe(false)
  })

  it('exposes targetHour and targetMinute', () => {
    vi.setSystemTime(new Date('2024-01-15T17:00:00'))
    const { result } = renderHook(() => useCountdown(17, 45))
    expect(result.current.targetHour).toBe(17)
    expect(result.current.targetMinute).toBe(45)
  })

  it('now is a Date object', () => {
    vi.setSystemTime(new Date('2024-01-15T10:00:00'))
    const { result } = renderHook(() => useCountdown(18, 0))
    expect(result.current.now).toBeInstanceOf(Date)
  })
})
