import { useEffect, useRef, useState } from 'react'
import { getRandomMessage, getSegmentLabel } from '../../data/copyEngine'
import styles from './CopyDisplay.module.css'

interface CopyDisplayProps {
  now: Date
}

export function CopyDisplay({ now }: CopyDisplayProps) {
  const hour = now.getHours()
  const label = getSegmentLabel(hour)

  const [message, setMessage] = useState(() => getRandomMessage(hour))
  const prevLabelRef = useRef(label)

  useEffect(() => {
    if (prevLabelRef.current !== label) {
      prevLabelRef.current = label
      setMessage(getRandomMessage(hour))
    }
  }, [label, hour])

  return (
    <div className={styles.card} data-testid="copy-display">
      <span className={styles.segLabel}>{label}</span>
      <span className={styles.message}>{message}</span>
    </div>
  )
}
