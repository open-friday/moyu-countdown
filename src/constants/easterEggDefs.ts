import type { EasterEggDef, EasterEggId } from '../types/easterEgg'

export const EGG_DEFS: EasterEggDef[] = [
  {
    id: 'time_noon',
    name: '摸鱼时间到！',
    description: '已到午休时间，放下鼠标，好好休息！',
    emoji: '🍱',
    type: 'time',
    color: '#F4C25E',
  },
  {
    id: 'time_offwork',
    name: '下班快乐！',
    description: '终于到了！冲出办公室，今晚全是你的！',
    emoji: '🎊',
    type: 'time',
    color: '#5B8DEF',
  },
  {
    id: 'time_fullhour',
    name: '整点报时',
    description: '又过了一小时，继续加油摸鱼！',
    emoji: '🔔',
    type: 'time',
    color: '#5DD39E',
  },
  {
    id: 'behavior_fish',
    name: '发现摸鱼者！',
    description: '哎？你在干什么？不好好上班！',
    emoji: '🐟',
    type: 'behavior',
    color: '#F08080',
  },
  {
    id: 'behavior_warp',
    name: '时间加速幻觉',
    description: '时间在你的凝视下开始扭曲加速...',
    emoji: '⏩',
    type: 'behavior',
    color: '#A786E5',
  },
]

export function getEggDef(id: EasterEggId): EasterEggDef | undefined {
  return EGG_DEFS.find(d => d.id === id)
}
