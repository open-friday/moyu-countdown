import { describe, expect, it } from 'vitest'
import {
  getDayType,
  getHolidayInfo,
  getHolidayReturnDate,
  getNextMonday9,
  isMakeupWorkday,
} from '../data/holidays2026'

function d(dateStr: string): Date {
  const [y, m, day] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, day, 10, 0, 0) // mid-morning for stable date
}

describe('getHolidayInfo', () => {
  it('returns null for a regular workday', () => {
    expect(getHolidayInfo(d('2026-03-16'))).toBeNull() // Monday
  })

  it('detects 元旦 on Jan 1', () => {
    const info = getHolidayInfo(d('2026-01-01'))
    expect(info?.name).toBe('元旦')
    expect(info?.returnDate).toBe('2026-01-05')
  })

  it('detects 元旦 on Jan 3 (last day)', () => {
    expect(getHolidayInfo(d('2026-01-03'))?.name).toBe('元旦')
  })

  it('returns null on Jan 4 (after 元旦)', () => {
    expect(getHolidayInfo(d('2026-01-04'))).toBeNull()
  })

  it('detects 春节 on Feb 17', () => {
    expect(getHolidayInfo(d('2026-02-17'))?.name).toBe('春节')
  })

  it('detects 国庆节 on Oct 1', () => {
    expect(getHolidayInfo(d('2026-10-01'))?.name).toBe('国庆节')
  })

  it('detects 国庆节 on Oct 7 (last day)', () => {
    expect(getHolidayInfo(d('2026-10-07'))?.name).toBe('国庆节')
  })

  it('returns null on Oct 8 (first day back)', () => {
    expect(getHolidayInfo(d('2026-10-08'))).toBeNull()
  })
})

describe('isMakeupWorkday', () => {
  it('returns true for Feb 14 (调休 before 春节)', () => {
    expect(isMakeupWorkday(d('2026-02-14'))).toBe(true)
  })

  it('returns false for a regular Saturday', () => {
    expect(isMakeupWorkday(d('2026-03-14'))).toBe(false) // Regular Saturday
  })
})

describe('getDayType', () => {
  it('workday for a regular Monday', () => {
    expect(getDayType(d('2026-03-16'))).toBe('workday') // Monday
  })

  it('weekend for a regular Saturday', () => {
    expect(getDayType(d('2026-03-14'))).toBe('weekend')
  })

  it('weekend for a regular Sunday', () => {
    expect(getDayType(d('2026-03-15'))).toBe('weekend')
  })

  it('workday for a makeup Saturday (调休)', () => {
    expect(getDayType(d('2026-02-14'))).toBe('workday') // Makeup workday before 春节
  })

  it('holiday for 国庆节 Oct 1', () => {
    expect(getDayType(d('2026-10-01'))).toBe('holiday')
  })

  it('holiday for 劳动节 May 1', () => {
    expect(getDayType(d('2026-05-01'))).toBe('holiday')
  })

  it('workday for May 6 (first day after 劳动节)', () => {
    expect(getDayType(d('2026-05-06'))).toBe('workday') // Wednesday after holiday
  })
})

describe('getNextMonday9', () => {
  it('returns next Monday from Saturday', () => {
    const sat = new Date(2026, 2, 14, 15, 0, 0) // Sat Mar 14
    const mon = getNextMonday9(sat)
    expect(mon.getDay()).toBe(1) // Monday
    expect(mon.getHours()).toBe(9)
    expect(mon.getMinutes()).toBe(0)
    expect(mon.getDate()).toBe(16) // Mar 16
  })

  it('returns next Monday from Sunday', () => {
    const sun = new Date(2026, 2, 15, 10, 0, 0) // Sun Mar 15
    const mon = getNextMonday9(sun)
    expect(mon.getDay()).toBe(1)
    expect(mon.getDate()).toBe(16) // Mar 16
    expect(mon.getHours()).toBe(9)
  })
})

describe('getHolidayReturnDate', () => {
  it('returns correct Date at 09:00', () => {
    const info = { name: '国庆节', returnDate: '2026-10-08' }
    const ret = getHolidayReturnDate(info)
    expect(ret.getFullYear()).toBe(2026)
    expect(ret.getMonth()).toBe(9) // October = index 9
    expect(ret.getDate()).toBe(8)
    expect(ret.getHours()).toBe(9)
    expect(ret.getMinutes()).toBe(0)
  })
})
