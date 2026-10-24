import { useWeeklyAdherence } from '../hooks/use-stats'

const weekFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

export function WeeklyAdherenceChart() {
  const { data = [] } = useWeeklyAdherence(8)

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Rien de planifié récemment.</p>
  }

  return (
    <div className="space-y-2">
      {data.map((week) => {
        const rate = week.planned > 0 ? Math.round((week.done / week.planned) * 100) : 0
        return (
          <div key={week.weekStart} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Semaine du {weekFormatter.format(new Date(week.weekStart))}</span>
              <span className="text-muted-foreground">
                {week.done}/{week.planned} réalisées ({rate}%)
              </span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-success" style={{ width: `${rate}%` }} />
              <div
                className="h-full bg-destructive/50"
                style={{ width: `${week.planned > 0 ? (week.skipped / week.planned) * 100 : 0}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
