// 2026 China National Holidays
// Estimated based on typical patterns; update when State Council announces official schedule.

export type DayType = 'workday' | 'weekend' | 'holiday'

export interface HolidayInfo {
  name: string
  returnDate: string // YYYY-MM-DD — first workday back (countdown target at 09:00)
}

interface HolidayPeriod {
  name: string
  start: string
  end: string
  returnDate: string
}

// Inclusive [start, end] date ranges for public holidays
const HOLIDAY_PERIODS: HolidayPeriod[] = [
  { name: '元旦',   start: '2026-01-01', end: '2026-01-03', returnDate: '2026-01-05' },
  { name: '春节',   start: '2026-02-16', end: '2026-02-23', returnDate: '2026-02-25' },
  { name: '清明节', start: '2026-04-04', end: '2026-04-06', returnDate: '2026-04-07' },
  { name: '劳动节', start: '2026-05-01', end: '2026-05-05', returnDate: '2026-05-06' },
  { name: '端午节', start: '2026-06-19', end: '2026-06-21', returnDate: '2026-06-22' },
  { name: '中秋节', start: '2026-09-25', end: '2026-09-27', returnDate: '2026-09-28' },
  { name: '国庆节', start: '2026-10-01', end: '2026-10-07', returnDate: '2026-10-08' },
]

// 调休: weekend dates that are officially workdays
const MAKEUP_WORKDAYS = new Set([
  '2026-02-14', // Sat before 春节
  '2026-02-28', // Sat after 春节
  '2026-04-25', // Sat before 劳动节
  '2026-05-09', // Sat after 劳动节
  '2026-09-26', // Sat before 国庆节
  '2026-10-10', // Sat after 国庆节
])

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getHolidayInfo(date: Date): HolidayInfo | null {
  const ds = toDateString(date)
  for (const p of HOLIDAY_PERIODS) {
    if (ds >= p.start && ds <= p.end) {
      return { name: p.name, returnDate: p.returnDate }
    }
  }
  return null
}

export function isMakeupWorkday(date: Date): boolean {
  return MAKEUP_WORKDAYS.has(toDateString(date))
}

export function getDayType(date: Date): DayType {
  if (getHolidayInfo(date)) return 'holiday'
  const dow = date.getDay()
  if ((dow === 0 || dow === 6) && !isMakeupWorkday(date)) return 'weekend'
  return 'workday'
}

export function getHolidayReturnDate(info: HolidayInfo): Date {
  const [y, m, d] = info.returnDate.split('-').map(Number)
  return new Date(y, m - 1, d, 9, 0, 0, 0)
}

// Returns Date of the upcoming Monday at 09:00 (for weekend countdown)
export function getNextMonday9(from: Date): Date {
  const d = new Date(from)
  const dow = d.getDay()
  // dow: 0=Sun → +1, 6=Sat → +2, else shouldn't be called but handle gracefully
  const daysToMonday = dow === 0 ? 1 : dow === 6 ? 2 : (8 - dow) % 7 || 7
  d.setDate(d.getDate() + daysToMonday)
  d.setHours(9, 0, 0, 0)
  return d
}
