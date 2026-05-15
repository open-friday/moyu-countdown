import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from '../components/ProgressBar/ProgressBar'

describe('ProgressBar', () => {
  it('shows 0% before work hours', () => {
    const now = new Date('2024-01-15T08:00:00')
    render(<ProgressBar now={now} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows 50% at midpoint of work day (13:30)', () => {
    const now = new Date('2024-01-15T13:30:00')
    render(<ProgressBar now={now} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows 100% after work hours', () => {
    const now = new Date('2024-01-15T19:00:00')
    render(<ProgressBar now={now} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('shows correct time', () => {
    const now = new Date('2024-01-15T14:30:00')
    render(<ProgressBar now={now} />)
    expect(screen.getByText(/14:30/)).toBeInTheDocument()
  })

  it('shows rank label', () => {
    const now = new Date('2024-01-15T14:30:00')
    render(<ProgressBar now={now} />)
    // At 14:30 (5.5h of 9h workday = ~61%), should be 摸鱼大师 rank
    expect(screen.getAllByText(/摸鱼/).length).toBeGreaterThan(0)
  })

  it('renders progress fill with correct width', () => {
    const now = new Date('2024-01-15T13:30:00') // 50%
    const { container } = render(<ProgressBar now={now} />)
    const fill = container.querySelector('[style*="width: 50%"]') as HTMLElement
    expect(fill).toBeTruthy()
  })

  it('shows 摸鱼当量 title', () => {
    render(<ProgressBar now={new Date('2024-01-15T10:00:00')} />)
    expect(screen.getByText('摸鱼当量')).toBeInTheDocument()
  })
})
