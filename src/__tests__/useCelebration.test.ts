import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCelebration } from '../hooks/useCelebration'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('useCelebration', () => {
  let rafCallCount = 0
  let rafSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    rafCallCount = 0
    // Only call the callback on first RAF to avoid infinite recursion
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      rafCallCount++
      if (rafCallCount <= 1) setTimeout(() => cb(Date.now()), 0)
      return rafCallCount
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('exposes celebrate and reset functions', () => {
    const { result } = renderHook(() => useCelebration())
    expect(typeof result.current.celebrate).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  it('celebrate fires confetti', async () => {
    const confettiMod = await import('canvas-confetti')
    const mockConfetti = vi.mocked(confettiMod.default)
    mockConfetti.mockClear()

    const { result } = renderHook(() => useCelebration())
    act(() => { result.current.celebrate() })
    expect(mockConfetti).toHaveBeenCalled()
  })

  it('celebrate only fires once without reset', async () => {
    const confettiMod = await import('canvas-confetti')
    const mockConfetti = vi.mocked(confettiMod.default)
    mockConfetti.mockClear()

    const { result } = renderHook(() => useCelebration())
    act(() => { result.current.celebrate() })
    const firstCount = mockConfetti.mock.calls.length
    act(() => { result.current.celebrate() })
    // Second call is no-op due to firedRef guard
    expect(mockConfetti.mock.calls.length).toBe(firstCount)
  })

  it('reset allows celebrate to fire again', async () => {
    rafCallCount = 0
    const confettiMod = await import('canvas-confetti')
    const mockConfetti = vi.mocked(confettiMod.default)
    mockConfetti.mockClear()

    const { result } = renderHook(() => useCelebration())
    act(() => { result.current.celebrate() })
    const firstCount = mockConfetti.mock.calls.length
    expect(firstCount).toBeGreaterThan(0)

    // Reset and fire again
    act(() => {
      result.current.reset()
      rafCallCount = 0
    })
    act(() => { result.current.celebrate() })
    expect(mockConfetti.mock.calls.length).toBeGreaterThan(firstCount)
  })

  afterEach(() => {
    expect(rafSpy).toBeDefined()
  })
})
