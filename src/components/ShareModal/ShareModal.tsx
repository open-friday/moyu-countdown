import { useRef, useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { ShareCard, type ShareCardProps } from '../ShareCard/ShareCard'
import styles from './ShareModal.module.css'

type ShareModalProps = Omit<ShareCardProps, never> & {
  onClose: () => void
}

async function generateCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    width: 375,
    height: 667,
  })
}

export function ShareModal({ onClose, ...cardProps }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const handleShare = useCallback(async () => {
    if (!cardRef.current || busy) return
    setBusy(true)
    try {
      const canvas = await generateCanvas(cardRef.current)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
      })

      const file = new File([blob], 'moyu-share.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '摸鱼倒计时', text: '今天的摸鱼成绩' })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'moyu-share.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setBusy(false)
    }
  }, [busy])

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="分享摸鱼成绩">
      <div className={styles.sheet}>
        <div className={styles.header}>
          <span className={styles.title}>分享摸鱼成绩</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">✕</button>
        </div>

        {/* Scaled preview container */}
        <div className={styles.previewWrap}>
          <div className={styles.previewScaler}>
            <ShareCard ref={cardRef} {...cardProps} />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>取消</button>
          <button
            className={styles.shareBtn}
            onClick={handleShare}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? (
              <><span className={styles.spin} aria-hidden="true" /> 生成中…</>
            ) : (
              '📤 保存 / 分享'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
