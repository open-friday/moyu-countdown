import { useEffect, useRef, useState } from 'react'
import styles from './SettingsSheet.module.css'

interface SettingsSheetProps {
  targetHour: number
  targetMinute: number
  onSave: (hour: number, minute: number) => void
  onClose: () => void
}

export function SettingsSheet({ targetHour, targetMinute, onSave, onClose }: SettingsSheetProps) {
  const [hour, setHour] = useState(String(targetHour).padStart(2, '0'))
  const [minute, setMinute] = useState(String(targetMinute).padStart(2, '0'))
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    const h = Math.min(23, Math.max(0, parseInt(hour, 10) || 0))
    const m = Math.min(59, Math.max(0, parseInt(minute, 10) || 0))
    onSave(h, m)
    onClose()
  }

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={styles.sheet} role="dialog" aria-label="设置下班时间">
        <div className={styles.grabber} />
        <h4 className={styles.title}>下班时间设置</h4>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>目标时间</label>
          <div className={styles.row}>
            <input
              className={styles.timeInput}
              type="number"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              aria-label="小时"
            />
            <span style={{ color: 'var(--color-text-3)', fontSize: '20px' }}>:</span>
            <input
              className={styles.timeInput}
              type="number"
              min={0}
              max={59}
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              aria-label="分钟"
            />
          </div>
          <span className={styles.hint}>工作日 {hour.padStart(2,'0')}:{minute.padStart(2,'0')} 下班</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.btn} onClick={onClose}>取消</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
