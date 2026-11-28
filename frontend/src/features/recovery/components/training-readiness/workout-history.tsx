import { Dumbbell } from 'lucide-react'

import { ErrorState, PageLoader } from '@/components/feedback'

import type { RecoveryDateRange } from '../../api/recovery-types'

import { ACTIVITY_LABELS } from '../../api/recovery-types'

import { useRecoveryWorkouts } from '../../hooks/use-recovery'

import {
  formatRecoveryDuration,
  formatRecoveryNumber,
  formatRecoveryWeight,
} from '../../utils/recovery-format'

import { DataStatusBadge } from '../common/data-status-badge'
import { WorkoutDetailsDialog } from '../forms/workout-details-dialog'

interface WorkoutHistoryProps {
  range: RecoveryDateRange
  timeZone?: string | null
}

const MISSING_DATA_LABELS: Record<string, string> = {
  DURATION: 'Durée de la séance',
  ACTIVITY_TYPE: "Type d'activité exploitable",
  BODY_WEIGHT: 'Poids corporel à la date de la séance',
  RPE: 'Intensité ressentie (RPE)',
}

function formatWorkoutDate(value?: string | null, timeZone?: string | null): string {
  if (!value) return '—'

  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timeZone ?? undefined,
  }).format(date)
}

export function WorkoutHistory({ range, timeZone }: WorkoutHistoryProps) {
  const query = useRecoveryWorkouts(range)

  const workouts = [...(query.data ?? [])].sort((a, b) =>
    (b.performedAt ?? '').localeCompare(a.performedAt ?? ''),
  )

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Historique des entraînements</h3>

        <p className="text-sm text-muted-foreground">
          Consultez vos séances et complétez les informations nécessaires à votre récupération.
        </p>
      </div>

      {query.isPending ? (
        <PageLoader />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : workouts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <Dumbbell className="size-8 text-muted-foreground" />

          <p className="font-medium">Aucun entraînement enregistré</p>

          <p className="text-sm text-muted-foreground">
            Aucune séance disponible sur cette période.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout, index) => (
            <article
              key={workout.workoutSessionId ?? index}
              className="space-y-4 rounded-xl border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Dumbbell className="size-5 text-primary" />
                  </div>

                  <div>
                    <h4 className="font-medium">{workout.title ?? 'Séance sportive'}</h4>

                    <p className="text-xs text-muted-foreground">
                      {formatWorkoutDate(workout.performedAt, timeZone)}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {workout.activityType
                        ? ACTIVITY_LABELS[workout.activityType]
                        : "Type d'activité non renseigné"}
                    </p>
                  </div>
                </div>

                <DataStatusBadge status={workout.dataStatus} />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Durée</p>

                  <p className="font-semibold">{formatRecoveryDuration(workout.durationMinutes)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">RPE effectif</p>

                  <p className="font-semibold">
                    {formatRecoveryNumber(workout.effectiveRpe, '/10')}
                  </p>

                  {workout.rpeSource === 'SET_AVERAGE' && (
                    <p className="text-xs text-muted-foreground">Estimé à partir des séries</p>
                  )}

                  {workout.rpeSource === 'SESSION' && (
                    <p className="text-xs text-muted-foreground">RPE global déclaré</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Charge sportive</p>

                  <p className="font-semibold">
                    {formatRecoveryNumber(workout.trainingLoad, 'UA')}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Calories actives estimées</p>

                  <p className="font-semibold">
                    {formatRecoveryNumber(workout.activeCaloriesKcal, 'kcal', 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Calories totales estimées</p>

                  <p className="font-semibold">
                    {formatRecoveryNumber(workout.totalCaloriesKcal, 'kcal', 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Poids utilisé</p>

                  <p className="font-semibold">{formatRecoveryWeight(workout.weightKg)}</p>

                  {workout.weightMeasuredOn && (
                    <p className="text-xs text-muted-foreground">
                      Mesure du {workout.weightMeasuredOn}
                    </p>
                  )}
                </div>
              </div>

              {(workout.missingData?.length ?? 0) > 0 && (
                <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-medium">Informations manquantes</p>

                  <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                    {(workout.missingData ?? []).map((item, itemIndex) => (
                      <li key={`${item}-${itemIndex}`}>{MISSING_DATA_LABELS[item] ?? item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {workout.workoutSessionId && (
                <div className="flex justify-end border-t pt-3">
                  <WorkoutDetailsDialog workout={workout} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Les dépenses caloriques sont des estimations fondées sur le type d'activité, le poids, la
        durée et l'intensité. Elles ne correspondent pas à des mesures réalisées par un capteur.
      </p>
    </section>
  )
}
