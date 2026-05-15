import { useEffect, useState } from 'react'

export interface CountdownState {
  now: Date
  totalSeconds: number
  isOffWork: boolean
  targetHour: number
  targetMinute: number
  setTarget: (hour: number, minute: number) => void
}

function calcSeconds(now: Date, targetHour: number, targetMinute: number): number {
  const target = new Date(now)
  target.setHours(targetHour, targetMinute, 0, 0)
  const diff = Math.floor((target.getTime() - now.getTime()) / 1000)
  return diff
}

export function useCountdown(defaultHour = 18, defaultMinute = 0): CountdownState {
  const [targetHour, setTargetHour] = useState(defaultHour)
  const [targetMinute, setTargetMinute] = useState(defaultMinute)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const rawSeconds = calcSeconds(now, targetHour, targetMinute)
  const isOffWork = rawSeconds <= 0
  const totalSeconds = Math.max(0, rawSeconds)

  function setTarget(hour: number, minute: number) {
    setTargetHour(hour)
    setTargetMinute(minute)
  }

  return { now, totalSeconds, isOffWork, targetHour, targetMinute, setTarget }
}
