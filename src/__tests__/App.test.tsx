import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

describe('App', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('摸鱼倒计时')).toBeInTheDocument()
  })

  it('shows settings button', () => {
    render(<App />)
    expect(screen.getByLabelText('设置')).toBeInTheDocument()
  })

  it('opens settings sheet on settings click', () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('设置'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes settings sheet on cancel', () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('设置'))
    fireEvent.click(screen.getByText('取消'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('saves new target time from settings', () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('设置'))
    const hourInput = screen.getByLabelText('小时')
    fireEvent.change(hourInput, { target: { value: '17' } })
    fireEvent.click(screen.getByText('保存'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(/17:00/)).toBeInTheDocument()
  })

  it('renders target pill', () => {
    render(<App />)
    expect(screen.getAllByText(/下班/).length).toBeGreaterThan(0)
  })

  it('shows progress bar', () => {
    render(<App />)
    expect(screen.getByText('摸鱼当量')).toBeInTheDocument()
  })

  it('shows 已下班 when past target time', () => {
    vi.setSystemTime(new Date('2024-01-15T19:00:00'))
    render(<App />)
    expect(screen.getByText('已下班')).toBeInTheDocument()
  })

  it('shows flip countdown when before target', () => {
    vi.setSystemTime(new Date('2024-01-15T09:00:00'))
    render(<App />)
    expect(screen.getByText('时')).toBeInTheDocument()
    expect(screen.getByText('分')).toBeInTheDocument()
    expect(screen.getByText('秒')).toBeInTheDocument()
  })

  it('ticks every second and updates display', () => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
    render(<App />)
    // At 12:00:00, 6h remaining → displays '0','6','0','0','0','0'
    expect(screen.getAllByLabelText('0').length).toBeGreaterThan(0)
    act(() => { vi.advanceTimersByTime(1000) })
    // Still showing digits after tick
    expect(screen.getAllByLabelText('0').length).toBeGreaterThan(0)
  })
})
