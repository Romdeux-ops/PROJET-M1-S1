import { Activity, Clock, HeartPulse, Dumbbell } from 'lucide-react'

import type { RecoveryOverviewResponse } from '../../api/recovery-types'

import {
  readDetailObject,
  readDetailNumber,
  formatRecoveryNumber,
} from '../../utils/recovery-format'

import { ScoreGauge } from '../common/score-gauge'
import { RecoveryMetricCard } from '../common/recovery-metric-card'
import { RecommendationCard } from '../common/recommendation-card'

import { RecoveryCheckinDialog } from '../forms/recovery-checkin-dialog'
import { SleepLogDialog } from '../forms/sleep-log-dialog'

interface ReadinessSummaryProps {
  overview: RecoveryOverviewResponse
}

export function ReadinessSummary({ overview }: ReadinessSummaryProps) {
  const assessment = overview.todayAssessment
  const checkin = overview.todayCheckin

  const details = readDetailObject(assessment?.calculationDetails)

  const training = readDetailObject(details?.training)

  const hoursSinceLastWorkout = readDetailNumber(training?.hoursSinceLastWorkout)

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
      <div>
        <h3 className="font-semibold">Votre préparation du jour</h3>

        <p className="text-sm text-muted-foreground">
          Estimation de votre capacité à reprendre un entraînement.
        </p>
      </div>

      <div className="flex justify-center py-3">
        <ScoreGauge
          kind="trainingReadiness"
          score={assessment?.trainingReadiness}
          size={220}
          showLabel={false}
        />
      </div>

      <RecommendationCard recommendation={assessment?.recommendation} />

      <div className="grid gap-3 sm:grid-cols-2">
        <RecoveryMetricCard
          label="Charge récente pondérée"
          value={formatRecoveryNumber(assessment?.recentTrainingLoad, 'UA')}
          icon={Activity}
          description="Charge des trois derniers jours"
        />

        <RecoveryMetricCard
          label="Depuis le dernier entraînement"
          value={formatRecoveryNumber(hoursSinceLastWorkout, 'h')}
          icon={Clock}
          estimated
          description="Depuis l'horaire enregistré de la séance"
        />

        <RecoveryMetricCard
          label="Courbatures"
          value={formatRecoveryNumber(checkin?.muscleSoreness, '/10', 0)}
          icon={Dumbbell}
          description="Ressenti musculaire déclaré"
        />

        <RecoveryMetricCard
          label="Fatigue ressentie"
          value={formatRecoveryNumber(checkin?.fatigueLevel, '/10', 0)}
          icon={HeartPulse}
          description="Information complémentaire"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <RecoveryCheckinDialog checkin={checkin} date={overview.date ?? undefined} />

        <SleepLogDialog sleepLog={overview.todaySleep} />
      </div>

      {assessment?.trainingReadiness == null && (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Votre préparation à l'entraînement ne peut pas encore être évaluée. Complétez votre
          sommeil, votre questionnaire quotidien et vos informations sportives.
        </p>
      )}
    </section>
  )
}
