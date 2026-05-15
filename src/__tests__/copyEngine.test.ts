import { describe, expect, it } from 'vitest'
import { getRandomMessage, getSegmentInfo, getSegmentLabel } from '../data/copyEngine'

describe('getSegmentInfo', () => {
  it('returns 凌晨修仙 for hour 0', () => {
    expect(getSegmentInfo(0).label).toBe('凌晨修仙')
  })

  it('returns 凌晨修仙 for hour 3', () => {
    expect(getSegmentInfo(3).label).toBe('凌晨修仙')
  })

  it('returns 早安摸鱼 for hour 6', () => {
    expect(getSegmentInfo(6).label).toBe('早安摸鱼')
  })

  it('returns 通勤摸鱼 for hour 8', () => {
    expect(getSegmentInfo(8).label).toBe('通勤摸鱼')
  })

  it('returns 上午摸鱼 for hour 9', () => {
    expect(getSegmentInfo(9).label).toBe('上午摸鱼')
  })

  it('returns 上午摸鱼 for hour 10', () => {
    expect(getSegmentInfo(10).label).toBe('上午摸鱼')
  })

  it('returns 午饭倒计时 for hour 11', () => {
    expect(getSegmentInfo(11).label).toBe('午饭倒计时')
  })

  it('returns 午后糊涂 for hour 13', () => {
    expect(getSegmentInfo(13).label).toBe('午后糊涂')
  })

  it('returns 下午觉醒 for hour 14', () => {
    expect(getSegmentInfo(14).label).toBe('下午觉醒')
  })

  it('returns 准备溜了 for hour 17', () => {
    expect(getSegmentInfo(17).label).toBe('准备溜了')
  })

  it('returns 自由时间 for hour 18', () => {
    expect(getSegmentInfo(18).label).toBe('自由时间')
  })

  it('returns 自由时间 for hour 23', () => {
    expect(getSegmentInfo(23).label).toBe('自由时间')
  })

  it('has at least 3 messages per segment', () => {
    for (let h = 0; h < 24; h++) {
      const seg = getSegmentInfo(h)
      expect(seg.messages.length).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('getSegmentLabel', () => {
  it('returns the segment label string', () => {
    expect(getSegmentLabel(9)).toBe('上午摸鱼')
    expect(getSegmentLabel(17)).toBe('准备溜了')
  })
})

describe('getRandomMessage', () => {
  it('returns a non-empty string', () => {
    expect(getRandomMessage(10).length).toBeGreaterThan(0)
  })

  it('returns a string within the segment messages', () => {
    const seg = getSegmentInfo(10)
    const msg = getRandomMessage(10)
    expect(seg.messages).toContain(msg)
  })
})
