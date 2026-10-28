import { motion } from 'motion/react'

import { useWeeklyVolume } from '../hooks/use-stats'

const weekFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

export function WeeklyVolumeChart() {
  const { data = [] } = useWeeklyVolume(12)

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Pas encore de séries enregistrées.</p>
  }

  const max = Math.max(1, ...data.map((d) => d.totalVolume))

  return (
    <div className="flex h-44 items-end gap-2" role="img" aria-label="Volume hebdomadaire">
      {data.map((week, index) => {
        const height = week.totalVolume === 0 ? 4 : Math.max(8, (week.totalVolume / max) * 100)
        return (
          <div
            key={week.weekStart}
            className="group flex h-full flex-1 flex-col items-center gap-2"
          >
            <div className="relative flex w-full flex-1 items-end">
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                {week.totalVolume.toLocaleString('fr-FR')} kg
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                className="w-full rounded-md bg-primary/40"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {weekFormatter.format(new Date(week.weekStart))}
            </span>
          </div>
        )
      })}
    </div>
  )
}
