import { Moon, HeartPulse, CheckCircle2, Scale } from 'lucide-react'

import type { RecoveryOverviewResponse } from '../../api/recovery-types'

import { formatRecoveryDuration, formatRecoveryWeight } from '../../utils/recovery-format'

import { SleepLogDialog } from '../forms/sleep-log-dialog'
import { RecoveryCheckinDialog } from '../forms/recovery-checkin-dialog'
import { BodyWeightDialog } from '../forms/body-weight-dialog'

interface DailyActionsProps {
  overview: RecoveryOverviewResponse
}

export function DailyActions({ overview }: DailyActionsProps) {
  const sleep = overview.todaySleep
  const checkin = overview.todayCheckin
  const weight = overview.weightSummary

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Mon suivi quotidien</h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-violet-500/10 p-3">
              <Moon className="size-5 text-violet-500" />
            </div>

            <div className="space-y-1">
              <h3 className="font-medium">Sommeil</h3>

              <p className="text-sm text-muted-foreground">
                {sleep
                  ? formatRecoveryDuration(sleep.estimatedSleepMinutes)
                  : 'Votre nuit reste à renseigner.'}
              </p>

              {sleep?.sleepDurationApproximate && (
                <p className="text-xs text-muted-foreground">Durée approximative</p>
              )}
            </div>
          </div>

          {sleep && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Sommeil renseigné
            </div>
          )}

          <div className="mt-auto">
            <SleepLogDialog sleepLog={sleep} />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <HeartPulse className="size-5 text-blue-500" />
            </div>

            <div className="space-y-1">
              <h3 className="font-medium">Ressenti quotidien</h3>

              <p className="text-sm text-muted-foreground">
                {checkin
                  ? 'Votre questionnaire est enregistré.'
                  : 'Comment vous sentez-vous aujourd’hui ?'}
              </p>
            </div>
          </div>

          {checkin && (
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Énergie : {checkin.energyLevel ?? '—'}/10</span>

              <span>Fatigue : {checkin.fatigueLevel ?? '—'}/10</span>

              <span>Stress : {checkin.stressLevel ?? '—'}/10</span>

              <span>Courbatures : {checkin.muscleSoreness ?? '—'}/10</span>
            </div>
          )}

          <div className="mt-auto">
            <RecoveryCheckinDialog checkin={checkin} date={overview.date ?? undefined} />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <Scale className="size-5 text-emerald-500" />
            </div>

            <div className="space-y-1">
              <h3 className="font-medium">Poids corporel</h3>

              <p className="text-sm text-muted-foreground">
                {weight?.currentWeightKg != null
                  ? formatRecoveryWeight(weight.currentWeightKg)
                  : 'Aucune mesure enregistrée.'}
              </p>

              {weight?.currentWeightMeasuredOn && (
                <p className="text-xs text-muted-foreground">
                  Dernière mesure : {weight.currentWeightMeasuredOn}
                </p>
              )}
            </div>
          </div>

          <div className="mt-auto">
            <BodyWeightDialog currentWeightKg={weight?.currentWeightKg} />
          </div>
        </div>
      </div>
    </section>
  )
}
