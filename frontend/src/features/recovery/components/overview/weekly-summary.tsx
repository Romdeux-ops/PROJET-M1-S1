import { Dumbbell, Timer, Flame, Activity, Moon, Battery, Gauge, CalendarDays } from 'lucide-react'

import type { RecoveryWeeklySummaryResponse } from '../../api/recovery-types'

import {
  formatRecoveryNumber,
  formatRecoveryDuration,
  formatRecoveryChartDate,
} from '../../utils/recovery-format'

import { RecoveryMetricCard } from '../common/recovery-metric-card'

interface WeeklySummaryProps {
  summary?: RecoveryWeeklySummaryResponse | null
}

export function WeeklySummary({ summary }: WeeklySummaryProps) {
  const period =
    summary?.weekStart && summary?.evaluatedThrough
      ? `Du ${formatRecoveryChartDate(summary.weekStart)} au ${formatRecoveryChartDate(summary.evaluatedThrough)}`
      : 'Semaine en cours'

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Votre semaine</h2>

        <p className="text-sm text-muted-foreground">{period}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RecoveryMetricCard
          label="Séances réalisées"
          value={summary?.workoutCount}
          icon={Dumbbell}
          description={
            summary?.trainingDays != null
              ? `${summary.trainingDays} jour(s) avec entraînement enregistré`
              : undefined
          }
        />

        <RecoveryMetricCard
          label="Temps d'entraînement"
          value={formatRecoveryDuration(summary?.recordedDurationMinutes)}
          icon={Timer}
          description={
            summary?.durationComplete === false
              ? 'Certaines durées ne sont pas renseignées.'
              : 'Durée totale enregistrée'
          }
        />

        <RecoveryMetricCard
          label="Charge d'entraînement"
          value={formatRecoveryNumber(summary?.totalTrainingLoad, 'UA')}
          icon={Activity}
          description={
            summary?.trainingLoadComplete === false
              ? `Charge connue : ${formatRecoveryNumber(summary.knownTrainingLoad, 'UA')}`
              : 'Charge cumulée des séances'
          }
        />

        <RecoveryMetricCard
          label="Calories actives"
          value={formatRecoveryNumber(summary?.totalActiveCaloriesKcal, 'kcal', 0)}
          icon={Flame}
          estimated
          description={
            summary?.caloriesComplete === false
              ? `Total partiel : ${formatRecoveryNumber(summary.knownActiveCaloriesKcal, 'kcal', 0)}`
              : 'Dépenses liées aux activités enregistrées'
          }
        />

        <RecoveryMetricCard
          label="Sommeil moyen"
          value={formatRecoveryDuration(summary?.averageSleepMinutes)}
          icon={Moon}
          description={
            summary?.sleepLogsCount != null
              ? `${summary.sleepLogsCount} nuit(s) renseignée(s)`
              : undefined
          }
          estimated={(summary?.approximateSleepLogsCount ?? 0) > 0}
        />

        <RecoveryMetricCard
          label="Body Battery moyenne"
          value={formatRecoveryNumber(summary?.averageBodyBattery, '/100')}
          icon={Battery}
          description={
            summary?.daysWithBodyBattery != null
              ? `${summary.daysWithBodyBattery} jour(s) évalué(s)`
              : undefined
          }
        />

        <RecoveryMetricCard
          label="Training Readiness moyenne"
          value={formatRecoveryNumber(summary?.averageTrainingReadiness, '/100')}
          icon={Gauge}
          description={
            summary?.daysWithTrainingReadiness != null
              ? `${summary.daysWithTrainingReadiness} jour(s) évalué(s)`
              : undefined
          }
        />

        <RecoveryMetricCard
          label="Jours sans séance enregistrée"
          value={summary?.daysWithoutRecordedTraining}
          icon={CalendarDays}
          description="Ne signifie pas nécessairement une journée de repos."
        />
      </div>
    </section>
  )
}
