export type EasterEggId =
  | 'time_noon'
  | 'time_offwork'
  | 'time_fullhour'
  | 'behavior_fish'
  | 'behavior_warp'

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
}
