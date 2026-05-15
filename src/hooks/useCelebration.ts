import confetti from 'canvas-confetti'
import { useCallback, useRef } from 'react'

export function useCelebration() {
  const firedRef = useRef(false)

  const celebrate = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true

    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#5B8DEF', '#94B5FF', '#F4C25E', '#5DD39E', '#A786E5', '#F49A4A'],
      })
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#5B8DEF', '#94B5FF', '#F4C25E', '#5DD39E', '#A786E5', '#F49A4A'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  const reset = useCallback(() => {
    firedRef.current = false
  }, [])

  return { celebrate, reset }
}
