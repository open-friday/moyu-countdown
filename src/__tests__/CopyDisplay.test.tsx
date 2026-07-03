import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CopyDisplay } from '../components/CopyDisplay/CopyDisplay'

describe('CopyDisplay refresh cooldown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-03T13:00:00'))
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.useRealTimers()
  })

  it('locks the frequent refresh copy during the 30 second cooldown', () => {
    render(<CopyDisplay now={new Date('2026-07-03T13:00:00')} />)

    const refreshButton = screen.getByText('刷新文案')
    fireEvent.click(refreshButton)
    fireEvent.click(refreshButton)
    fireEvent.click(refreshButton)

    expect(screen.getByText('急什么，秒针很努力了。')).toBeInTheDocument()
    expect(Number(sessionStorage.getItem('moyu_refresh_cooldown_until'))).toBe(Date.now() + 30_000)

    fireEvent.click(refreshButton)
    fireEvent.click(refreshButton)

    expect(screen.getByText('急什么，秒针很努力了。')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(screen.queryByText('急什么，秒针很努力了。')).not.toBeInTheDocument()
    expect(sessionStorage.getItem('moyu_refresh_cooldown_until')).toBeNull()
  })
})
