import type { DayType } from '../../data/holidays2026'
import styles from './DayTypeBadge.module.css'

interface DayTypeBadgeProps {
  dayType: DayType
  holidayName?: string
}

const CONFIG = {
  workday: { icon: '💼', text: '工作日', cls: styles.workday },
  weekend: { icon: '🌴', text: '周末',   cls: styles.weekend },
  holiday: { icon: '🎊', text: '节假日', cls: styles.holiday },
} as const

export function DayTypeBadge({ dayType, holidayName }: DayTypeBadgeProps) {
  const { icon, text, cls } = CONFIG[dayType]
  const label = dayType === 'holiday' && holidayName ? holidayName : text
  return (
    <span className={`${styles.badge} ${cls}`} data-testid="day-type-badge">
      {icon} {label}
    </span>
  )
}
