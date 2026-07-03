import type { EasterEggDef, EasterEggId } from '../types/easterEgg'

export const EGG_DEFS: EasterEggDef[] = [
  {
    id: 'egg_lunch_signal',
    name: '午饭信号',
    description: '11:30 到点开饭，先把自己从工位解救出来。',
    emoji: '🍱',
    type: 'time',
    color: '#F4C25E',
  },
  {
    id: 'egg_friday_confetti',
    name: '周五撒花',
    description: '周五 15:00，空气里已经有一点放假的味道。',
    emoji: '🎊',
    type: 'time',
    color: '#FF7A59',
  },
  {
    id: 'egg_hour_flash',
    name: '整点报时',
    description: '又过了一小时，继续加油摸鱼！',
    emoji: '🔔',
    type: 'time',
    color: '#5DD39E',
  },
  {
    id: 'egg_overtime',
    name: '加班检测',
    description: '下班两小时后还亮着屏幕，今天的你有点过载。',
    emoji: '🌃',
    type: 'time',
    color: '#5B8DEF',
  },
  {
    id: 'egg_midnight',
    name: '深夜修仙',
    description: '零点已过，理性提醒：摸鱼也需要睡眠。',
    emoji: '🌙',
    type: 'time',
    color: '#A786E5',
  },
  {
    id: 'egg_longpress',
    name: '长按数字',
    description: '按住倒计时 3 秒，时间没有变快，心态先晃了一下。',
    emoji: '⏳',
    type: 'behavior',
    color: '#F08080',
  },
  {
    id: 'egg_doubletap_blank',
    name: '双击空白',
    description: '你敲了敲页面，页面假装什么都没发生。',
    emoji: '👀',
    type: 'behavior',
    color: '#4FC3C7',
  },
  {
    id: 'egg_frenzy_refresh',
    name: '高频刷新',
    description: '刷新太勤，倒计时决定先吐槽 30 秒。',
    emoji: '🔁',
    type: 'behavior',
    color: '#A786E5',
  },
]

export function getEggDef(id: EasterEggId): EasterEggDef | undefined {
  return EGG_DEFS.find(d => d.id === id)
}
