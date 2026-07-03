export type EasterEggId =
  | 'egg_lunch_signal'
  | 'egg_friday_confetti'
  | 'egg_hour_flash'
  | 'egg_overtime'
  | 'egg_midnight'
  | 'egg_longpress'
  | 'egg_doubletap_blank'
  | 'egg_frenzy_refresh'

export type EasterEggTriggerType = 'time' | 'behavior'

export interface EasterEggDef {
  id: EasterEggId
  name: string
  description: string
  emoji: string
  type: EasterEggTriggerType
  color: string
}

export interface EasterEggItem {
  def: EasterEggDef
  unlocked: boolean
  firstUnlockedAt?: string
}
