import { useMuscleDistribution } from '../hooks/use-stats'

export function MuscleDistributionChart() {
  const { data = [] } = useMuscleDistribution(30)

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Pas assez de données sur les 30 derniers jours.</p>
  }

  const total = data.reduce((sum, m) => sum + m.volume, 0)
  const max = Math.max(...data.map((m) => m.volume))

  return (
    <div className="space-y-2">
      {data.map((muscle) => {
        const percent = total > 0 ? Math.round((muscle.volume / total) * 100) : 0
        return (
          <div key={muscle.muscleGroupId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{muscle.muscleGroupName}</span>
              <span className="text-muted-foreground">{percent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary/60"
                style={{ width: `${Math.max(2, (muscle.volume / max) * 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
