import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FlipCountdown } from '../components/FlipCountdown/FlipCountdown'

describe('FlipCountdown', () => {
  it('shows 已下班 when isOffWork is true', () => {
    render(<FlipCountdown totalSeconds={0} isOffWork={true} />)
    expect(screen.getByText('已下班')).toBeInTheDocument()
    expect(screen.getByText('🎉')).toBeInTheDocument()
  })

  it('shows digit cards when counting down', () => {
    // 1h 2m 3s = 3723 seconds
    render(<FlipCountdown totalSeconds={3723} isOffWork={false} />)
    expect(screen.getByText('时')).toBeInTheDocument()
    expect(screen.getByText('分')).toBeInTheDocument()
    expect(screen.getByText('秒')).toBeInTheDocument()
  })

  it('shows correct hours digit', () => {
    // 3600s = 1 hour 0 min 0 sec
    render(<FlipCountdown totalSeconds={3600} isOffWork={false} />)
    // Hours: "01", Minutes: "00", Seconds: "00"
    expect(screen.getAllByLabelText('0').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('1').length).toBeGreaterThan(0)
  })

  it('does not show 已下班 when isOffWork is false', () => {
    render(<FlipCountdown totalSeconds={100} isOffWork={false} />)
    expect(screen.queryByText('已下班')).not.toBeInTheDocument()
  })

  it('shows separator colons', () => {
    render(<FlipCountdown totalSeconds={3600} isOffWork={false} />)
    const colons = screen.getAllByText(':')
    expect(colons.length).toBe(2)
  })

  it('pads single-digit values to two digits', () => {
    // 65 seconds = 0h 1m 5s
    render(<FlipCountdown totalSeconds={65} isOffWork={false} />)
    expect(screen.getByLabelText('5')).toBeInTheDocument()
  })
})
