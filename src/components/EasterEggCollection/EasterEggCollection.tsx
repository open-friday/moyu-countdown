import type { EasterEggId, EasterEggItem } from '../../types/easterEgg'
import styles from './EasterEggCollection.module.css'

interface EasterEggCollectionProps {
  eggs: EasterEggItem[]
  onClose: () => void
  onReplay: (id: EasterEggId) => void
}

export function EasterEggCollection({ eggs, onClose, onReplay }: EasterEggCollectionProps) {
  const unlockedCount = eggs.filter(e => e.unlocked).length

  return (
    <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="彩蛋图鉴">
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>彩蛋图鉴</div>
            <div className={styles.subtitle}>
              已解锁 {unlockedCount} / {eggs.length}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className={styles.grid}>
          {eggs.map(({ def, unlocked }) => (
            <button
              key={def.id}
              className={`${styles.eggCard} ${unlocked ? styles.unlocked : styles.locked}`}
              onClick={() => unlocked && onReplay(def.id)}
              disabled={!unlocked}
              aria-label={unlocked ? `重播：${def.name}` : '尚未解锁'}
              style={unlocked ? ({ '--egg-color': def.color } as React.CSSProperties) : undefined}
            >
              <div className={styles.eggEmoji}>{unlocked ? def.emoji : '❓'}</div>
              <div className={styles.eggName}>{unlocked ? def.name : '???'}</div>
              {unlocked && (
                <div className={styles.eggType}>
                  {def.type === 'time' ? '⏰ 时间触发' : '🖱 行为触发'}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className={styles.hint}>
          点击已解锁的彩蛋可重播 · 快速点击倒计时或长按进度条试试
        </div>
      </div>
    </div>
  )
}
