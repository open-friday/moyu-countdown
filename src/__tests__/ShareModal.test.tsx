import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import html2canvas from 'html2canvas'
import { ShareModal } from '../components/ShareModal/ShareModal'

vi.mock('html2canvas', () => ({
  default: vi.fn(),
}))

const mockBlob = new Blob(['png'], { type: 'image/png' })

function makeCanvas() {
  const canvas = document.createElement('canvas')
  canvas.toBlob = vi.fn((cb) => cb(mockBlob))
  return canvas
}

const BASE_PROPS = {
  totalSeconds: 3600,
  isOffWork: false,
  pct: 50,
  dateStr: '2026年5月15日星期五',
  weekday: 'fri' as const,
  accentColor: '#F4C25E',
  onClose: vi.fn(),
}

describe('ShareModal', () => {
  beforeEach(() => {
    BASE_PROPS.onClose = vi.fn()
    vi.mocked(html2canvas).mockResolvedValue(makeCanvas() as any)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    })
    // default: no native share
    Object.defineProperty(navigator, 'canShare', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  it('renders via portal into document.body', () => {
    render(<ShareModal {...BASE_PROPS} />)
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', '分享摸鱼成绩')
  })

  it('renders modal title', () => {
    render(<ShareModal {...BASE_PROPS} />)
    expect(screen.getByText('分享摸鱼成绩')).toBeInTheDocument()
  })

  it('renders share and cancel buttons', () => {
    render(<ShareModal {...BASE_PROPS} />)
    expect(screen.getByText('📤 保存 / 分享')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<ShareModal {...BASE_PROPS} />)
    fireEvent.click(screen.getByLabelText('关闭'))
    expect(BASE_PROPS.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', () => {
    render(<ShareModal {...BASE_PROPS} />)
    fireEvent.click(screen.getByText('取消'))
    expect(BASE_PROPS.onClose).toHaveBeenCalledTimes(1)
  })

  it('share button is initially enabled', () => {
    render(<ShareModal {...BASE_PROPS} />)
    const btn = screen.getByText('📤 保存 / 分享').closest('button')
    expect(btn).not.toBeDisabled()
  })

  it('renders ShareCard preview inside modal', () => {
    render(<ShareModal {...BASE_PROPS} />)
    expect(screen.getByText('摸鱼倒计时 · MOYU')).toBeInTheDocument()
  })

  it('triggers download fallback when canShare is unavailable', async () => {
    const clickSpy = vi.fn()
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag)
      if (tag === 'a') {
        vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(clickSpy)
      }
      return el
    })

    render(<ShareModal {...BASE_PROPS} />)
    const btn = screen.getByText('📤 保存 / 分享').closest('button')!
    fireEvent.click(btn)

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
    })
    expect(clickSpy).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')

    vi.restoreAllMocks()
  })

  it('uses native share when canShare returns true', async () => {
    const shareSpy = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'canShare', {
      value: vi.fn(() => true),
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: shareSpy,
      writable: true,
      configurable: true,
    })

    render(<ShareModal {...BASE_PROPS} />)
    const btn = screen.getByText('📤 保存 / 分享').closest('button')!
    fireEvent.click(btn)

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: '摸鱼倒计时', text: '今天的摸鱼成绩' })
      )
    })
  })

  it('shows busy spinner while generating', async () => {
    // Make html2canvas hang to observe busy state
    vi.mocked(html2canvas).mockReturnValue(new Promise(() => {}) as any)

    render(<ShareModal {...BASE_PROPS} />)
    fireEvent.click(screen.getByText('📤 保存 / 分享').closest('button')!)

    await waitFor(() => {
      expect(screen.getByText(/生成中/)).toBeInTheDocument()
    })
    const btn = screen.getByText(/生成中/).closest('button')!
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })
})
