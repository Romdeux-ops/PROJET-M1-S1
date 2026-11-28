import { useState } from 'react'

import { Activity, Gauge, Dumbbell, CalendarDays } from 'lucide-react'

import { todayIso } from '@/lib/format'

import type { RecoveryOverviewResponse, RecoveryDateRange } from '../../api/recovery-types'

import { formatRecoveryNumber, isAvailable } from '../../utils/recovery-format'

import { HistoryPeriodSelector, type HistoryPeriod } from '../common/history-period-selector'

import { ScoreTrendChart } from '../common/score-trend-chart'
import { RecoveryMetricCard } from '../common/recovery-metric-card'
import { DataStatusBadge } from '../common/data-status-badge'

import { ReadinessSummary } from './readiness-summary'
import { ReadinessFactors } from './readiness-factors'
import { TrainingLoadChart } from './training-load-chart'
import { WorkoutHistory } from './workout-history'
import { CheckinHistory } from './checkin-history'

interface TrainingReadinessTabProps {
  overview: RecoveryOverviewResponse
}

function getDateRange(endDate: string, period: HistoryPeriod): RecoveryDateRange {
  const start = new Date(`${endDate}T12:00:00Z`)

  start.setUTCDate(start.getUTCDate() - period + 1)

  return {
    from: start.toISOString().slice(0, 10),
    to: endDate,
  }
}

function average(values: Array<number | null | undefined>): number | null {
  const available = values.filter(isAvailable)

  if (available.length === 0) return null

  return available.reduce((sum, value) => sum + value, 0) / available.length
}

export function TrainingReadinessTab({ overview }: TrainingReadinessTabProps) {
  const [period, setPeriod] = useState<HistoryPeriod>(7)

  const assessment = overview.todayAssessment

  const range = getDateRange(overview.date ?? todayIso(), period)

  const history = (overview.dailyTrends ?? [])
    .filter(
      (item) => typeof item.date === 'string' && item.date >= range.from && item.date <= range.to,
    )
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))

  const readinessScores = history.map((item) => item.trainingReadiness)

  const averageReadiness = average(readinessScores)

  const evaluatedDays = readinessScores.filter(isAvailable).length

  const knownLoads = history.map((item) => item.trainingLoad).filter(isAvailable)

  const knownLoadTotal =
    knownLoads.length > 0 ? knownLoads.reduce((sum, value) => sum + value, 0) : null

  const loadComplete = knownLoads.length === period

  const totalLoad = loadComplete ? knownLoadTotal : null

  const workoutCounts = history.map((item) => item.workoutCount).filter(isAvailable)

  const workoutCount =
    workoutCounts.length === period ? workoutCounts.reduce((sum, value) => sum + value, 0) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Training Readiness</h2>

          <p className="text-sm text-muted-foreground">
            Évaluez votre préparation et adaptez votre entraînement à votre récupération.
          </p>
        </div>

        <DataStatusBadge status={assessment?.dataStatus} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <ReadinessSummary overview={overview} />

        <ReadinessFactors assessment={assessment} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Historique de préparation</h3>

          <HistoryPeriodSelector value={period} onChange={setPeriod} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <RecoveryMetricCard
            label="Préparation moyenne"
            value={formatRecoveryNumber(averageReadiness, '/100')}
            icon={Gauge}
            description={`${evaluatedDays} jour(s) évalué(s)`}
          />

          <RecoveryMetricCard
            label="Charge cumulée"
            value={formatRecoveryNumber(totalLoad, 'UA')}
            icon={Activity}
            description={
              loadComplete
                ? `Sur ${period} jours`
                : `Somme des charges journalières disponibles : ${formatRecoveryNumber(knownLoadTotal, 'UA')}`
            }
          />

          <RecoveryMetricCard
            label="Séances enregistrées"
            value={workoutCount}
            icon={Dumbbell}
            description={`Sur ${period} jours`}
          />

          <RecoveryMetricCard
            label="Jours évalués"
            value={evaluatedDays}
            icon={CalendarDays}
            description={`Sur ${period} jours`}
          />
        </div>

        <ScoreTrendChart
          data={history}
          metrics={['trainingReadiness']}
          title="Évolution de la Training Readiness"
          description={`Scores disponibles sur les ${period} derniers jours.`}
        />

        <TrainingLoadChart data={history} />
      </section>

      <WorkoutHistory range={range} timeZone={overview.timeZone} />

      <CheckinHistory range={range} />

      <p className="rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
        Les recommandations FitCoach sont produites par un modèle expérimental à partir des données
        enregistrées et déclarées. Elles constituent une aide à la décision et ne garantissent pas
        votre aptitude physique à l'entraînement.
      </p>
    </div>
  )
}
