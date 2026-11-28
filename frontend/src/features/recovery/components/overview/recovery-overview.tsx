import { Dumbbell } from 'lucide-react'

import type { RecoveryOverviewResponse } from '../../api/recovery-types'

import { ACTIVITY_LABELS } from '../../api/recovery-types'

import { formatRecoveryDuration, formatRecoveryNumber } from '../../utils/recovery-format'

import { OverviewScores } from './overview-scores'
import { DailyActions } from './daily-actions'
import { WeeklySummary } from './weekly-summary'
import { PlanningSummary } from './planning-summary'
import { WeightSummary } from './weight-summary'

import { ScoreTrendChart } from '../common/score-trend-chart'
import { RecommendationCard } from '../common/recommendation-card'
import { DataStatusBadge } from '../common/data-status-badge'

import { WorkoutDetailsDialog } from '../forms/workout-details-dialog'

interface RecoveryOverviewProps {
  overview: RecoveryOverviewResponse
}

export function RecoveryOverview({ overview }: RecoveryOverviewProps) {
  const assessment = overview.todayAssessment
  const weeklySummary = overview.weeklySummary

  const workouts = overview.todayTraining?.workouts ?? []

  return (
    <div className="space-y-8">
      <OverviewScores assessment={assessment} />

      <RecommendationCard recommendation={assessment?.recommendation} />

      <DailyActions overview={overview} />

      <WeeklySummary summary={weeklySummary} />

      <ScoreTrendChart
        data={overview.dailyTrends ?? []}
        title="Évolution de la récupération"
        description="Historique de vos trois indicateurs sur les 30 derniers jours."
      />

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <PlanningSummary planning={weeklySummary?.planning} />

        <WeightSummary summary={overview.weightSummary} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-5 text-muted-foreground" />

          <h2 className="text-lg font-semibold">Entraînements du jour</h2>
        </div>

        {workouts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun entraînement enregistré aujourd'hui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout, index) => (
              <div
                key={workout.workoutSessionId ?? index}
                className="space-y-4 rounded-xl border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-medium">{workout.title ?? 'Séance sportive'}</h3>

                    <p className="text-sm text-muted-foreground">
                      {workout.activityType
                        ? ACTIVITY_LABELS[workout.activityType]
                        : "Type d'activité non renseigné"}
                    </p>
                  </div>

                  <DataStatusBadge status={workout.dataStatus} />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Durée</p>

                    <p className="font-medium">{formatRecoveryDuration(workout.durationMinutes)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">RPE effectif</p>

                    <p className="font-medium">
                      {formatRecoveryNumber(workout.effectiveRpe, '/10')}
                    </p>

                    {workout.rpeSource === 'SET_AVERAGE' && (
                      <p className="text-xs text-muted-foreground">Estimé à partir des séries</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Charge</p>

                    <p className="font-medium">
                      {formatRecoveryNumber(workout.trainingLoad, 'UA')}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Calories actives estimées</p>

                    <p className="font-medium">
                      {formatRecoveryNumber(workout.activeCaloriesKcal, 'kcal', 0)}
                    </p>
                  </div>
                </div>

                <WorkoutDetailsDialog workout={workout} />
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
        Les indicateurs Recovery sont des estimations issues de modèles expérimentaux utilisant vos
        données déclaratives et vos entraînements enregistrés. Ils ne remplacent pas une mesure
        physiologique ni un avis médical.
      </p>
    </div>
  )
}
