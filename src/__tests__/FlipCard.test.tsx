import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FlipCard } from '../components/FlipCard/FlipCard'

describe('FlipCard', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('renders the given digit', () => {
    render(<FlipCard digit="5" />)
    expect(screen.getByLabelText('5')).toBeInTheDocument()
  })

  it('shows old digit during flip animation', () => {
    const { rerender } = render(<FlipCard digit="3" />)
    rerender(<FlipCard digit="4" />)
    // During animation the displayed digit stays as "3" until timeout
    expect(screen.getByLabelText('4')).toBeInTheDocument()
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
  })

  it('updates displayed digit after flip timeout', () => {
    const { rerender } = render(<FlipCard digit="3" />)
    rerender(<FlipCard digit="7" />)
    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders digit 0', () => {
    render(<FlipCard digit="0" />)
    expect(screen.getByLabelText('0')).toBeInTheDocument()
  })

  it('renders digit 9', () => {
    render(<FlipCard digit="9" />)
    expect(screen.getByLabelText('9')).toBeInTheDocument()
  })

  it('does not show flap when digit unchanged', () => {
    const { container, rerender } = render(<FlipCard digit="5" />)
    rerender(<FlipCard digit="5" />)
    const flapEl = container.querySelector('[class*="flap"]')
    expect(flapEl).toBeNull()
  })
})
