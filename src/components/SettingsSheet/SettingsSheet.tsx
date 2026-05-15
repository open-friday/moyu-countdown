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
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    const sh = Math.min(21, Math.max(6, parseInt(sHour, 10) || 6))
    const sm = Math.min(59, Math.max(0, parseInt(sMinute, 10) || 0))
    const eh = Math.min(22, Math.max(7, parseInt(eHour, 10) || 7))
    const em = Math.min(59, Math.max(0, parseInt(eMinute, 10) || 0))
    // ensure start < end
    const finalSh = sh < eh ? sh : Math.max(6, eh - 1)
    onSave(finalSh, sm, eh, em)
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
              max={21}
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
              min={7}
              max={22}
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

        <div className={styles.actions}>
          <button className={styles.btn} onClick={onClose}>取消</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
