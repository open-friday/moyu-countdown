import { useEffect, useState } from 'react'
import {
  getDayType,
  getHolidayInfo,
  getHolidayReturnDate,
  getNextMonday9,
  type DayType,
  type HolidayInfo,
} from '../data/holidays2026'

export interface DayCountdownState {
  now: Date
  dayType: DayType
  holidayInfo: HolidayInfo | null
  totalSeconds: number
  isDone: boolean
  countdownLabel: string
  targetHour: number
  targetMinute: number
  setWorkEndTarget: (hour: number, minute: number) => void
}

export function useDayCountdown(defaultHour = 18, defaultMinute = 0): DayCountdownState {
  const [workEndHour, setWorkEndHour] = useState(defaultHour)
  const [workEndMinute, setWorkEndMinute] = useState(defaultMinute)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const dayType = getDayType(now)
  const holidayInfo = getHolidayInfo(now)

  let targetDate: Date
  let countdownLabel: string

  if (dayType === 'holiday' && holidayInfo) {
    targetDate = getHolidayReturnDate(holidayInfo)
    countdownLabel = `${holidayInfo.name}假期 · 距上班`
  } else if (dayType === 'weekend') {
    targetDate = getNextMonday9(now)
    countdownLabel = '周末快乐 · 距周一开工'
  } else {
    // workday: countdown to today's work-end time
    targetDate = new Date(now)
    targetDate.setHours(workEndHour, workEndMinute, 0, 0)
    countdownLabel = `工作日 · 距下班 ${String(workEndHour).padStart(2, '0')}:${String(workEndMinute).padStart(2, '0')}`
  }

  const rawSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000)
  const isDone = rawSeconds <= 0
  const totalSeconds = Math.max(0, rawSeconds)

  return {
    now,
    dayType,
    holidayInfo,
    totalSeconds,
    isDone,
    countdownLabel,
    targetHour: workEndHour,
    targetMinute: workEndMinute,
    setWorkEndTarget: (h, m) => {
      setWorkEndHour(h)
      setWorkEndMinute(m)
    },
  }
}
