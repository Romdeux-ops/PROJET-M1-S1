import { Activity, Dumbbell, Flame, type LucideIcon, StretchHorizontal } from 'lucide-react'

import type { SessionType } from '../schemas'

export const SESSION_TYPE_STYLES: Record<SessionType, { icon: LucideIcon; className: string }> = {
  STRENGTH: { icon: Dumbbell, className: 'bg-primary/12 text-primary' },
  CARDIO: { icon: Activity, className: 'bg-chart-4/15 text-chart-4' },
  HIIT: { icon: Flame, className: 'bg-chart-2/15 text-chart-2' },
  MOBILITY: { icon: StretchHorizontal, className: 'bg-success/15 text-success' },
}
