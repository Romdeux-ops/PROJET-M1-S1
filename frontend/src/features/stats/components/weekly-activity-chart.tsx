import { motion } from 'motion/react'

import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { StatsOverview } from '../api/stats-api'

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })

export function WeeklyActivityChart({ data }: { data: StatsOverview['weeklyActivity'] }) {
  const max = Math.max(60, ...data.map((d) => d.minutes))
  return (
    <div
      className="flex h-44 items-end gap-2 sm:gap-3"
      role="img"
      aria-label="Activité des 7 derniers jours"
    >
      {data.map((day, index) => {
        const isToday = index === data.length - 1
        const height = day.minutes === 0 ? 4 : Math.max(8, (day.minutes / max) * 100)
        return (
          <div key={day.date} className="group flex h-full flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end">
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                {day.minutes ? formatDuration(day.minutes) : 'Repos'}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'w-full rounded-md transition-opacity group-hover:opacity-90',
                  day.minutes === 0 ? 'bg-muted' : isToday ? 'bg-brand' : 'bg-primary/35',
                )}
              />
            </div>
            <span
              className={cn(
                'text-xs capitalize',
                isToday ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {dayFormatter.format(new Date(day.date)).replace('.', '')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
