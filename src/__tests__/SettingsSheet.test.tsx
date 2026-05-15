import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SettingsSheet } from '../components/SettingsSheet/SettingsSheet'

describe('SettingsSheet', () => {
  it('renders with current target time', () => {
    render(
      <SettingsSheet targetHour={18} targetMinute={0} onSave={vi.fn()} onClose={vi.fn()} />
    )
    const hourInput = screen.getByLabelText('小时') as HTMLInputElement
    expect(hourInput.value).toBe('18')
  })

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn()
    render(
      <SettingsSheet targetHour={18} targetMinute={0} onSave={vi.fn()} onClose={onClose} />
    )
    fireEvent.click(screen.getByText('取消'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onSave and onClose when save clicked', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(
      <SettingsSheet targetHour={18} targetMinute={0} onSave={onSave} onClose={onClose} />
    )
    const hourInput = screen.getByLabelText('小时')
    fireEvent.change(hourInput, { target: { value: '17' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledWith(17, 0)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('clamps hour above 23 to 23', () => {
    const onSave = vi.fn()
    render(
      <SettingsSheet targetHour={18} targetMinute={0} onSave={onSave} onClose={vi.fn()} />
    )
    const hourInput = screen.getByLabelText('小时')
    fireEvent.change(hourInput, { target: { value: '99' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledWith(23, 0)
  })

  it('clamps minute above 59 to 59', () => {
    const onSave = vi.fn()
    render(
      <SettingsSheet targetHour={18} targetMinute={0} onSave={onSave} onClose={vi.fn()} />
    )
    const minInput = screen.getByLabelText('分钟')
    fireEvent.change(minInput, { target: { value: '99' } })
    fireEvent.click(screen.getByText('保存'))
    expect(onSave).toHaveBeenCalledWith(18, 59)
  })

  it('closes on Escape key', () => {
    const onClose = vi.fn()
    render(
      <SettingsSheet targetHour={18} targetMinute={0} onSave={vi.fn()} onClose={onClose} />
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows dialog role', () => {
    render(
      <SettingsSheet targetHour={18} targetMinute={0} onSave={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
