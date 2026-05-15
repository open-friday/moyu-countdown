import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShareCard } from '../components/ShareCard/ShareCard'

const BASE_PROPS = {
  totalSeconds: 3600,
  isOffWork: false,
  pct: 50,
  dateStr: '2026年5月15日星期五',
  weekday: 'fri',
  accentColor: '#F4C25E',
}

describe('ShareCard', () => {
  it('renders brand text', () => {
    render(<ShareCard {...BASE_PROPS} />)
    expect(screen.getByText('摸鱼倒计时 · MOYU')).toBeInTheDocument()
  })

  it('shows countdown time when working', () => {
    render(<ShareCard {...BASE_PROPS} totalSeconds={3723} />)
    // 1h 2m 3s
    expect(screen.getByText('1:02:03')).toBeInTheDocument()
  })

  it('shows 已下班 when off work', () => {
    render(<ShareCard {...BASE_PROPS} isOffWork={true} totalSeconds={0} />)
    expect(screen.getByText(/已下班/)).toBeInTheDocument()
  })

  it('shows progress percentage', () => {
    render(<ShareCard {...BASE_PROPS} pct={75} />)
    expect(screen.getByText(/摸鱼当量 75%/)).toBeInTheDocument()
  })

  it('shows date in footer', () => {
    render(<ShareCard {...BASE_PROPS} />)
    expect(screen.getByText('2026年5月15日星期五')).toBeInTheDocument()
  })

  it('shows moyu.app in footer', () => {
    render(<ShareCard {...BASE_PROPS} />)
    expect(screen.getByText('moyu.app')).toBeInTheDocument()
  })

  it('shows correct rank at 50%', () => {
    render(<ShareCard {...BASE_PROPS} pct={50} />)
    expect(screen.getByText(/摸鱼高手/)).toBeInTheDocument()
  })

  it('shows legend rank at 90%+', () => {
    render(<ShareCard {...BASE_PROPS} pct={90} />)
    expect(screen.getByText(/摸鱼传说/)).toBeInTheDocument()
  })

  it('applies accent color as inline gradient background', () => {
    const { container } = render(<ShareCard {...BASE_PROPS} accentColor="#FF0000" />)
    const card = container.firstChild as HTMLElement
    // jsdom normalizes hex to rgb in computed style
    expect(card.style.background).toMatch(/rgb\(255,\s*0,\s*0\)|#FF0000/i)
  })
})
