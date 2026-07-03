import { useEffect, useRef, useState } from 'react'
import styles from './SettingsSheet.module.css'

interface SettingsSheetProps {
  startHour: number
  startMinute: number
  targetHour: number
  targetMinute: number
  onSave: (startH: number, startM: number, endH: number, endM: number) => void
  onClose: () => void
}

export function SettingsSheet({ startHour, startMinute, targetHour, targetMinute, onSave, onClose }: SettingsSheetProps) {
  const [sHour, setSHour] = useState(String(startHour).padStart(2, '0'))
  const [sMinute, setSMinute] = useState(String(startMinute).padStart(2, '0'))
  const [eHour, setEHour] = useState(String(targetHour).padStart(2, '0'))
  const [eMinute, setEMinute] = useState(String(targetMinute).padStart(2, '0'))
  const [message, setMessage] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  function resetToCurrentSettings() {
    setSHour(String(startHour).padStart(2, '0'))
    setSMinute(String(startMinute).padStart(2, '0'))
    setEHour(String(targetHour).padStart(2, '0'))
    setEMinute(String(targetMinute).padStart(2, '0'))
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    const sh = parseInt(sHour, 10)
    const sm = parseInt(sMinute, 10)
    const eh = parseInt(eHour, 10)
    const em = parseInt(eMinute, 10)
    const startTotal = sh * 60 + sm
    const endTotal = eh * 60 + em

    if (Number.isNaN(startTotal) || sh < 6 || sh > 22 || sm < 0 || sm > 59) {
      setMessage('上班时间需在 06:00–22:00 之间')
      resetToCurrentSettings()
      return
    }
    if (Number.isNaN(endTotal) || eh > 23 || em < 0 || em > 59) {
      setMessage('暂不支持跨夜班')
      resetToCurrentSettings()
      return
    }
    if (endTotal <= startTotal) {
      setMessage('下班时间需晚于上班时间')
      resetToCurrentSettings()
      return
    }

    setMessage('')
    onSave(sh, sm, eh, em)
    onClose()
  }

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={styles.sheet} role="dialog" aria-label="设置上下班时间">
        <div className={styles.grabber} />
        <h4 className={styles.title}>上下班时间设置</h4>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>上班时间</label>
          <div className={styles.row}>
            <input
              className={styles.timeInput}
              type="number"
              min={6}
              max={22}
              value={sHour}
              onChange={(e) => setSHour(e.target.value)}
              aria-label="上班小时"
            />
            <span style={{ color: 'var(--color-text-3)', fontSize: '20px' }}>:</span>
            <input
              className={styles.timeInput}
              type="number"
              min={0}
              max={59}
              value={sMinute}
              onChange={(e) => setSMinute(e.target.value)}
              aria-label="上班分钟"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>下班时间</label>
          <div className={styles.row}>
            <input
              className={styles.timeInput}
              type="number"
              min={6}
              max={23}
              value={eHour}
              onChange={(e) => setEHour(e.target.value)}
              aria-label="小时"
            />
            <span style={{ color: 'var(--color-text-3)', fontSize: '20px' }}>:</span>
            <input
              className={styles.timeInput}
              type="number"
              min={0}
              max={59}
              value={eMinute}
              onChange={(e) => setEMinute(e.target.value)}
              aria-label="分钟"
            />
          </div>
          <span className={styles.hint}>工作日 {sHour.padStart(2,'0')}:{sMinute.padStart(2,'0')} 上班 → {eHour.padStart(2,'0')}:{eMinute.padStart(2,'0')} 下班</span>
        </div>

        {message && (
          <p className={styles.message} role="status">
            {message}
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.btn} onClick={onClose}>取消</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
