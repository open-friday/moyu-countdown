import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EasterEggCollection } from '../components/EasterEggCollection/EasterEggCollection'
import { EGG_DEFS } from '../constants/easterEggDefs'
import type { EasterEggItem } from '../types/easterEgg'

function makeEggs(unlockedIds: string[] = []): EasterEggItem[] {
  return EGG_DEFS.map(def => ({ def, unlocked: unlockedIds.includes(def.id) }))
}

describe('EasterEggCollection', () => {
  it('renders all 5 egg cards', () => {
    render(
      <EasterEggCollection eggs={makeEggs()} onClose={vi.fn()} onReplay={vi.fn()} />
    )
    // All locked shows 5 "???" entries
    expect(screen.getAllByText('???')).toHaveLength(5)
  })

  it('shows unlocked count in subtitle', () => {
    render(
      <EasterEggCollection
        eggs={makeEggs(['time_noon', 'behavior_fish'])}
        onClose={vi.fn()}
        onReplay={vi.fn()}
      />
    )
    expect(screen.getByText(/已解锁 2 \/ 5/)).toBeInTheDocument()
  })

  it('shows egg name and emoji for unlocked egg', () => {
    render(
      <EasterEggCollection
        eggs={makeEggs(['time_noon'])}
        onClose={vi.fn()}
        onReplay={vi.fn()}
      />
    )
    expect(screen.getByText('摸鱼时间到！')).toBeInTheDocument()
    expect(screen.getByText('🍱')).toBeInTheDocument()
  })

  it('shows ??? and ❓ for locked eggs', () => {
    render(
      <EasterEggCollection eggs={makeEggs()} onClose={vi.fn()} onReplay={vi.fn()} />
    )
    expect(screen.getAllByText('???').length).toBeGreaterThan(0)
    expect(screen.getAllByText('❓').length).toBeGreaterThan(0)
  })

  it('calls onReplay with correct id when unlocked egg is clicked', async () => {
    const onReplay = vi.fn()
    render(
      <EasterEggCollection
        eggs={makeEggs(['behavior_fish'])}
        onClose={vi.fn()}
        onReplay={onReplay}
      />
    )
    await userEvent.click(screen.getByText('发现摸鱼者！'))
    expect(onReplay).toHaveBeenCalledWith('behavior_fish')
  })

  it('does not call onReplay when locked egg is clicked', async () => {
    const onReplay = vi.fn()
    render(
      <EasterEggCollection eggs={makeEggs()} onClose={vi.fn()} onReplay={onReplay} />
    )
    // All locked — click the first ??? button (disabled)
    const lockedButtons = screen.getAllByRole('button', { name: /尚未解锁/i })
    await userEvent.click(lockedButtons[0])
    expect(onReplay).not.toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    render(
      <EasterEggCollection eggs={makeEggs()} onClose={onClose} onReplay={vi.fn()} />
    )
    const backdrop = document.querySelector('[class*="backdrop"]') as HTMLElement
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <EasterEggCollection eggs={makeEggs()} onClose={onClose} onReplay={vi.fn()} />
    )
    await userEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows trigger type for unlocked eggs', () => {
    render(
      <EasterEggCollection
        eggs={makeEggs(['time_noon', 'behavior_fish'])}
        onClose={vi.fn()}
        onReplay={vi.fn()}
      />
    )
    expect(screen.getByText('⏰ 时间触发')).toBeInTheDocument()
    expect(screen.getByText('🖱 行为触发')).toBeInTheDocument()
  })
})
