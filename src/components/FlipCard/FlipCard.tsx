import { useEffect, useRef, useState } from 'react'
import styles from './FlipCard.module.css'

interface FlipCardProps {
  digit: string
}

export function FlipCard({ digit }: FlipCardProps) {
  const [displayed, setDisplayed] = useState(digit)
  const [flipping, setFlipping] = useState(false)
  const nextDigit = useRef(digit)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (digit === displayed) return

    nextDigit.current = digit
    setFlipping(true)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setDisplayed(digit)
      setFlipping(false)
    }, 300)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [digit, displayed])

  return (
    <div className={styles.flip} aria-label={digit}>
      <div className={styles.current}>{displayed}</div>
      {flipping && (
        <div key={`${displayed}->${nextDigit.current}`} className={styles.flap}>
          <div className={styles.flapInner}>{displayed}</div>
        </div>
      )}
    </div>
  )
}
