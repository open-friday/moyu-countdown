import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SettingsSheet } from '../components/SettingsSheet/SettingsSheet'

const defaultProps = {
  startHour: 9,
  startMinute: 0,
  targetHour: 18,
  targetMinute: 0,
  onSave: vi.fn(),
  onClose: vi.fn(),
}

describe('SettingsSheet', () => {
  it('renders with current end target time', () => {
    render(<SettingsSheet {...defaultProps} />)
    const hourInput = screen.getByLabelText('小时') as HTMLInputElement
    expect(hourInput.value).toBe('18')
  })

  it('renders with current start time', () => {
    render(<SettingsSheet {...defaultProps} />)
    const startHourInput = screen.getByLabelText('上班小时') as HTMLInputElement
    expect(startHourInput.value).toBe('09')
  })

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn()
    render(<SettingsSheet {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('取消'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onSave and onClose when save clicked', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(<SettingsSheet {...defaultProps} onSave={onSave} onClose={onClose} />)
    const hourInput = screen.getByLabelText('小时')
    fireEvent.change(hourInput, { target: { value: '17' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledWith(9, 0, 17, 0)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('keeps valid end hour up to 23', () => {
    const onSave = vi.fn()
    render(<SettingsSheet {...defaultProps} onSave={onSave} onClose={vi.fn()} />)
    const hourInput = screen.getByLabelText('小时')
    fireEvent.change(hourInput, { target: { value: '23' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledWith(9, 0, 23, 0)
  })

  it('rejects start time below 06:00 and restores the effective value', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(<SettingsSheet {...defaultProps} onSave={onSave} onClose={onClose} />)
    const startHourInput = screen.getByLabelText('上班小时') as HTMLInputElement
    const startMinuteInput = screen.getByLabelText('上班分钟') as HTMLInputElement
    fireEvent.change(startHourInput, { target: { value: '5' } })
    fireEvent.change(startMinuteInput, { target: { value: '30' } })
    fireEvent.click(screen.getByText('保存'))
    expect(screen.getByText('上班时间需在 06:00–22:00 之间')).toBeInTheDocument()
    expect(startHourInput.value).toBe('09')
    expect(startMinuteInput.value).toBe('00')
    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('rejects invalid end minute without saving', () => {
    const onSave = vi.fn()
    render(<SettingsSheet {...defaultProps} onSave={onSave} onClose={vi.fn()} />)
    const minInput = screen.getByLabelText('分钟')
    fireEvent.change(minInput, { target: { value: '99' } })
    fireEvent.click(screen.getByText('保存'))
    expect(screen.getByText('暂不支持跨夜班')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('closes on Escape key', () => {
    const onClose = vi.fn()
    render(<SettingsSheet {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows dialog role', () => {
    render(<SettingsSheet {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows hint text with both times', () => {
    render(<SettingsSheet {...defaultProps} />)
    expect(screen.getByText(/09:00 上班 → 18:00 下班/)).toBeInTheDocument()
  })
})
