import { useState } from 'react'

import { Battery, BatteryCharging, Moon, HeartPulse } from 'lucide-react'

import type { RecoveryOverviewResponse } from '../../api/recovery-types'

import {
  readDetailObject,
  readDetailNumber,
  formatRecoveryNumber,
  formatRecoveryChartDate,
} from '../../utils/recovery-format'

import { ScoreGauge } from '../common/score-gauge'
import { ScoreTrendChart } from '../common/score-trend-chart'
import { DataStatusBadge } from '../common/data-status-badge'
import { RecoveryMetricCard } from '../common/recovery-metric-card'

import { HistoryPeriodSelector, type HistoryPeriod } from '../common/history-period-selector'

import { SleepLogDialog } from '../forms/sleep-log-dialog'
import { RecoveryCheckinDialog } from '../forms/recovery-checkin-dialog'

import { BodyBatteryFactors } from './body-battery-factors'
import { BodyBatteryExplanation } from './body-battery-explanation'

interface BodyBatteryTabProps {
  overview: RecoveryOverviewResponse
}

export function BodyBatteryTab({ overview }: BodyBatteryTabProps) {
  const [period, setPeriod] = useState<HistoryPeriod>(7)

  const assessment = overview.todayAssessment

  const details = readDetailObject(assessment?.calculationDetails)

  const battery = readDetailObject(details?.bodyBattery)

  const morningBattery = readDetailNumber(battery?.morningBattery)

  const recharge = readDetailNumber(battery?.sleepRecharge) ?? assessment?.sleepRecharge

  const history = (overview.dailyTrends ?? [])
    .filter((item) => typeof item.date === 'string')
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    .slice(-period)

  const availableScores = history
    .map((item) => item.bodyBattery)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  const average =
    availableScores.length > 0
      ? availableScores.reduce((sum, score) => sum + score, 0) / availableScores.length
      : null

  const minimum = availableScores.length > 0 ? Math.min(...availableScores) : null

  const maximum = availableScores.length > 0 ? Math.max(...availableScores) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Body Battery</h2>

          <p className="text-sm text-muted-foreground">
            Suivez votre niveau d'énergie estimé et les facteurs qui influencent votre récupération.
          </p>
        </div>

        <DataStatusBadge status={assessment?.dataStatus} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <section className="space-y-5 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">Votre énergie du jour</h3>

            {overview.date && (
              <span className="text-xs text-muted-foreground">
                {formatRecoveryChartDate(overview.date)}
              </span>
            )}
          </div>

          <div className="flex justify-center py-3">
            <ScoreGauge
              kind="bodyBattery"
              score={assessment?.bodyBattery}
              size={220}
              showLabel={false}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <RecoveryMetricCard
              label="Énergie au réveil"
              value={formatRecoveryNumber(morningBattery, '/100')}
              icon={Battery}
            />

            <RecoveryMetricCard
              label="Recharge du sommeil"
              value={formatRecoveryNumber(recharge, 'pts')}
              icon={BatteryCharging}
              estimated
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 border-t pt-4">
            <SleepLogDialog sleepLog={overview.todaySleep} />

            <RecoveryCheckinDialog
              checkin={overview.todayCheckin}
              date={overview.date ?? undefined}
            />
          </div>

          {assessment?.bodyBattery == null && (
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              Votre score n'est pas encore disponible. Complétez votre sommeil, votre ressenti
              quotidien et les informations manquantes de vos entraînements, puis actualisez les
              indicateurs.
            </p>
          )}
        </section>

        <BodyBatteryFactors assessment={assessment} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Historique de votre énergie</h3>

          <HistoryPeriodSelector value={period} onChange={setPeriod} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <RecoveryMetricCard
            label="Body Battery moyenne"
            value={formatRecoveryNumber(average, '/100')}
            icon={Battery}
            description={`${availableScores.length} jour(s) évalué(s) sur ${period}`}
          />

          <RecoveryMetricCard
            label="Score minimum"
            value={formatRecoveryNumber(minimum, '/100', 0)}
            icon={Moon}
            description={`${period} derniers jours`}
          />

          <RecoveryMetricCard
            label="Score maximum"
            value={formatRecoveryNumber(maximum, '/100', 0)}
            icon={HeartPulse}
            description={`${period} derniers jours`}
          />
        </div>

        <ScoreTrendChart
          data={history}
          metrics={['bodyBattery']}
          title="Évolution de la Body Battery"
          description={`Scores journaliers disponibles sur les ${period} derniers jours.`}
        />
      </section>

      <BodyBatteryExplanation assessment={assessment} />
    </div>
  )
}
