import { useEffect } from 'react'
import { getEggDef } from '../../constants/easterEggDefs'
import type { EasterEggId } from '../../types/easterEgg'
import styles from './EasterEggOverlay.module.css'

interface EasterEggOverlayProps {
  eggId: EasterEggId
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 4500

export function EasterEggOverlay({ eggId, onDismiss }: EasterEggOverlayProps) {
  const def = getEggDef(eggId)

  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [eggId, onDismiss])

  if (!def) return null

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={def.name}
      onClick={onDismiss}
    >
      <div
        className={styles.card}
        onClick={e => e.stopPropagation()}
        style={{ '--egg-color': def.color } as React.CSSProperties}
      >
        <div className={styles.emoji}>{def.emoji}</div>
        <div className={styles.name}>{def.name}</div>
        <div className={styles.desc}>{def.description}</div>
        <button className={styles.dismiss} onClick={onDismiss}>
          知道了
        </button>
      </div>
    </div>
  )
}
