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

  it('clamps end hour above 22 to 22', () => {
    const onSave = vi.fn()
    render(<SettingsSheet {...defaultProps} onSave={onSave} onClose={vi.fn()} />)
    const hourInput = screen.getByLabelText('小时')
    fireEvent.change(hourInput, { target: { value: '99' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledWith(9, 0, 22, 0)
  })

  it('clamps start hour below 6 to 6', () => {
    const onSave = vi.fn()
    render(<SettingsSheet {...defaultProps} onSave={onSave} onClose={vi.fn()} />)
    const startHourInput = screen.getByLabelText('上班小时')
    fireEvent.change(startHourInput, { target: { value: '2' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledWith(6, 0, 18, 0)
  })

  it('clamps minute above 59 to 59', () => {
    const onSave = vi.fn()
    render(<SettingsSheet {...defaultProps} onSave={onSave} onClose={vi.fn()} />)
    const minInput = screen.getByLabelText('分钟')
    fireEvent.change(minInput, { target: { value: '99' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledWith(9, 0, 18, 59)
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
