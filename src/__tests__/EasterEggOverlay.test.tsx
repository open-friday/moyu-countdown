import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EasterEggOverlay } from '../components/EasterEggOverlay/EasterEggOverlay'

describe('EasterEggOverlay', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders the egg name and emoji for a known egg', () => {
    render(<EasterEggOverlay eggId="egg_lunch_signal" onDismiss={vi.fn()} />)
    expect(screen.getByText('午饭信号')).toBeInTheDocument()
    expect(screen.getByText('🍱')).toBeInTheDocument()
  })

  it('renders the dismiss button', () => {
    render(<EasterEggOverlay eggId="egg_frenzy_refresh" onDismiss={vi.fn()} />)
    expect(screen.getByText('知道了')).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(<EasterEggOverlay eggId="egg_overtime" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByText('知道了'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when overlay backdrop is clicked', () => {
    const onDismiss = vi.fn()
    render(<EasterEggOverlay eggId="egg_hour_flash" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('auto-dismisses after 4500ms', () => {
    const onDismiss = vi.fn()
    render(<EasterEggOverlay eggId="egg_longpress" onDismiss={onDismiss} />)
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(4500))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('resets auto-dismiss timer when eggId changes', () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<EasterEggOverlay eggId="egg_lunch_signal" onDismiss={onDismiss} />)

    act(() => vi.advanceTimersByTime(2000))
    expect(onDismiss).not.toHaveBeenCalled()

    // Change the egg — timer should reset
    rerender(<EasterEggOverlay eggId="egg_overtime" onDismiss={onDismiss} />)
    act(() => vi.advanceTimersByTime(2500))
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(2500))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('shows correct content for frenzy refresh', () => {
    render(<EasterEggOverlay eggId="egg_frenzy_refresh" onDismiss={vi.fn()} />)
    expect(screen.getByText('高频刷新')).toBeInTheDocument()
    expect(screen.getByText('🔁')).toBeInTheDocument()
  })

  it('shows correct content for longpress', () => {
    render(<EasterEggOverlay eggId="egg_longpress" onDismiss={vi.fn()} />)
    expect(screen.getByText('长按数字')).toBeInTheDocument()
    expect(screen.getByText('⏳')).toBeInTheDocument()
  })
})
