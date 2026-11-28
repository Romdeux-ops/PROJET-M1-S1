import { useState } from 'react'

import { Moon, Clock, CalendarDays, Star } from 'lucide-react'

import { todayIso } from '@/lib/format'

import type { RecoveryOverviewResponse, RecoveryDateRange } from '../../api/recovery-types'

import {
  formatRecoveryNumber,
  formatRecoveryDuration,
  isAvailable,
} from '../../utils/recovery-format'

import { HistoryPeriodSelector, type HistoryPeriod } from '../common/history-period-selector'

import { ScoreTrendChart } from '../common/score-trend-chart'
import { RecoveryMetricCard } from '../common/recovery-metric-card'
import { DataStatusBadge } from '../common/data-status-badge'

import { SleepSummary } from './sleep-summary'
import { SleepScoreFactors } from './sleep-score-factors'
import { SleepDurationChart } from './sleep-duration-chart'
import { SleepLogHistory } from './sleep-log-history'

interface SleepTabProps {
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

export function SleepTab({ overview }: SleepTabProps) {
  const [period, setPeriod] = useState<HistoryPeriod>(7)

  const assessment = overview.todayAssessment

  const range = getDateRange(overview.date ?? todayIso(), period)

  const history = (overview.dailyTrends ?? [])
    .filter(
      (item) => typeof item.date === 'string' && item.date >= range.from && item.date <= range.to,
    )
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))

  const sleepDurations = history.map((item) => item.estimatedSleepMinutes)

  const sleepScores = history.map((item) => item.sleepScore)

  const sleepQualities = history.map((item) => item.sleepQuality)

  const averageDuration = average(sleepDurations)
  const averageScore = average(sleepScores)
  const averageQuality = average(sleepQualities)

  const recordedNights = sleepDurations.filter(isAvailable).length

  const evaluatedNights = sleepScores.filter(isAvailable).length

  const approximateNights = history.filter(
    (item) => isAvailable(item.estimatedSleepMinutes) && item.sleepDurationApproximate === true,
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Sleep Score</h2>

          <p className="text-sm text-muted-foreground">
            Analysez la durée, la qualité et la régularité de votre sommeil.
          </p>
        </div>

        <DataStatusBadge status={assessment?.dataStatus} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <SleepSummary overview={overview} />

        <SleepScoreFactors assessment={assessment} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Historique du sommeil</h3>

          <HistoryPeriodSelector value={period} onChange={setPeriod} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <RecoveryMetricCard
            label="Durée moyenne"
            value={formatRecoveryDuration(averageDuration)}
            icon={Clock}
            estimated={approximateNights > 0}
            description={`${recordedNights} nuit(s) renseignée(s)`}
          />

          <RecoveryMetricCard
            label="Sleep Score moyen"
            value={formatRecoveryNumber(averageScore, '/100')}
            icon={Moon}
            description={`${evaluatedNights} nuit(s) évaluée(s)`}
          />

          <RecoveryMetricCard
            label="Qualité moyenne"
            value={formatRecoveryNumber(averageQuality, '/10')}
            icon={Star}
            description="Qualité déclarée"
          />

          <RecoveryMetricCard
            label="Nuits renseignées"
            value={recordedNights}
            icon={CalendarDays}
            description={`Sur ${period} jours`}
          />
        </div>

        <ScoreTrendChart
          data={history}
          metrics={['sleepScore']}
          title="Évolution du Sleep Score"
          description={`Scores disponibles sur les ${period} derniers jours.`}
        />

        <SleepDurationChart data={history} targetMinutes={overview.settings?.sleepTargetMinutes} />
      </section>

      <SleepLogHistory range={range} timeZone={overview.timeZone} />

      <p className="rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
        Les indicateurs de sommeil sont calculés à partir de vos informations déclaratives. Ils ne
        constituent pas une analyse médicale du sommeil et ne permettent pas de diagnostiquer un
        trouble du sommeil.
      </p>
    </div>
  )
}
