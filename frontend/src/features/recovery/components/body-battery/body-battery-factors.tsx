import { Moon, Dumbbell, Brain, Clock, BatteryCharging } from 'lucide-react'

import type { RecoveryAssessmentResponse } from '../../api/recovery-types'

import {
  readDetailObject,
  readDetailNumber,
  formatRecoveryNumber,
} from '../../utils/recovery-format'

interface BodyBatteryFactorsProps {
  assessment?: RecoveryAssessmentResponse | null
}

export function BodyBatteryFactors({ assessment }: BodyBatteryFactorsProps) {
  const details = readDetailObject(assessment?.calculationDetails)

  const battery = readDetailObject(details?.bodyBattery)

  const recharge = readDetailNumber(battery?.sleepRecharge) ?? assessment?.sleepRecharge

  const trainingDrain = readDetailNumber(battery?.trainingDrain) ?? assessment?.trainingDrain

  const stressDrain = readDetailNumber(battery?.stressDrain) ?? assessment?.stressDrain

  const dailyDrain = readDetailNumber(battery?.dailyDrain) ?? assessment?.dailyDrain

  const factors = [
    {
      label: 'Recharge liée au sommeil',
      description: 'Contribution positive du sommeil à votre énergie.',
      value: recharge,
      positive: true,
      icon: Moon,
    },
    {
      label: "Consommation liée à l'entraînement",
      description: 'Énergie consommée selon la charge sportive enregistrée.',
      value: trainingDrain,
      positive: false,
      icon: Dumbbell,
    },
    {
      label: 'Consommation liée au stress',
      description: 'Influence du stress déclaré dans le questionnaire.',
      value: stressDrain,
      positive: false,
      icon: Brain,
    },
    {
      label: 'Consommation quotidienne',
      description: 'Diminution estimée liée au temps passé éveillé.',
      value: dailyDrain,
      positive: false,
      icon: Clock,
    },
  ]

  const maxValue = Math.max(1, ...factors.map((factor) => factor.value ?? 0))

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/10 p-3">
          <BatteryCharging className="size-5 text-blue-500" />
        </div>

        <div>
          <h3 className="font-semibold">Facteurs de variation énergétique</h3>

          <p className="text-xs text-muted-foreground">Contributions estimées par le modèle</p>
        </div>
      </div>

      <div className="space-y-5">
        {factors.map((factor) => {
          const Icon = factor.icon

          const available = typeof factor.value === 'number' && Number.isFinite(factor.value)

          const value = available ? Math.max(0, factor.value ?? 0) : null

          const color = factor.positive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'

          const barColor = factor.positive ? 'bg-emerald-500' : 'bg-red-500'

          return (
            <div key={factor.label} className="space-y-2">
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{factor.label}</p>

                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>

                <span
                  className={`shrink-0 font-semibold tabular-nums ${
                    value === null ? 'text-muted-foreground' : color
                  }`}
                >
                  {value === null
                    ? '—'
                    : `${value === 0 ? '' : factor.positive ? '+' : '−'}${formatRecoveryNumber(value)}`}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                {value !== null && (
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{
                      width: `${(value / maxValue) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        Ces valeurs représentent des contributions en points d'énergie estimés, et non des calories.
        Les barres comparent leur importance relative.
      </p>
    </section>
  )
}
