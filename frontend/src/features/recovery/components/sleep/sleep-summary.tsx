import { Moon, Sunrise, Clock, Target } from 'lucide-react'

import type { RecoveryOverviewResponse } from '../../api/recovery-types'

import {
  formatRecoveryDuration,
  formatRecoveryNumber,
  isAvailable,
} from '../../utils/recovery-format'

import { ScoreGauge } from '../common/score-gauge'
import { RecoveryMetricCard } from '../common/recovery-metric-card'
import { SleepLogDialog } from '../forms/sleep-log-dialog'
import { RecoverySettingsDialog } from '../forms/recovery-settings-dialog'

interface SleepSummaryProps {
  overview: RecoveryOverviewResponse
}

function formatSleepTime(value?: string | null, timeZone?: string | null): string {
  if (!value) return '—'

  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone ?? undefined,
  }).format(date)
}

export function SleepSummary({ overview }: SleepSummaryProps) {
  const sleep = overview.todaySleep
  const settings = overview.settings
  const assessment = overview.todayAssessment

  const duration = sleep?.estimatedSleepMinutes
  const target = settings?.sleepTargetMinutes

  const progress =
    isAvailable(duration) && isAvailable(target) && target > 0 ? (duration / target) * 100 : null

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
      <div>
        <h3 className="font-semibold">Votre sommeil du jour</h3>

        <p className="text-sm text-muted-foreground">Nuit associée à la date du réveil.</p>
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="flex justify-center">
          <ScoreGauge
            kind="sleepScore"
            score={assessment?.sleepScore}
            size={220}
            showLabel={false}
          />
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">Durée estimée du sommeil</p>

            <p className="mt-1 text-3xl font-bold tabular-nums">
              {formatRecoveryDuration(duration)}
            </p>

            {sleep?.sleepDurationApproximate && (
              <p className="mt-1 text-xs text-muted-foreground">
                Durée approximative : temps éveillé pendant la nuit non renseigné.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Target className="size-4" />
                Objectif personnel
              </span>

              <span className="font-medium">{formatRecoveryDuration(target)}</span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              {progress !== null && (
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                  }}
                />
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {progress !== null
                ? `${formatRecoveryNumber(progress, '%', 0)} de l'objectif atteint`
                : 'Progression indisponible'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <Moon className="mb-2 size-4 text-violet-500" />

              <p className="text-xs text-muted-foreground">Coucher</p>

              <p className="font-semibold tabular-nums">
                {formatSleepTime(sleep?.bedtime, overview.timeZone)}
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <Sunrise className="mb-2 size-4 text-amber-500" />

              <p className="text-xs text-muted-foreground">Réveil</p>

              <p className="font-semibold tabular-nums">
                {formatSleepTime(sleep?.wakeTime, overview.timeZone)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <RecoveryMetricCard
          label="Qualité déclarée"
          value={formatRecoveryNumber(sleep?.sleepQuality, '/10', 0)}
          icon={Moon}
        />

        <RecoveryMetricCard
          label="Temps passé au lit"
          value={formatRecoveryDuration(sleep?.timeInBedMinutes)}
          icon={Clock}
        />

        <RecoveryMetricCard label="Réveils nocturnes" value={sleep?.nightAwakenings} />
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <SleepLogDialog sleepLog={sleep} />

        <RecoverySettingsDialog settings={settings} />
      </div>

      {!sleep && (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Aucun journal de sommeil enregistré aujourd'hui. Renseignez votre nuit pour obtenir une
          estimation de votre Sleep Score.
        </p>
      )}
    </section>
  )
}
