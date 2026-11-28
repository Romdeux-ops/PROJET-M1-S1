import { Battery, Moon, Activity, Dumbbell, Clock, Info } from 'lucide-react'

import type { RecoveryAssessmentResponse } from '../../api/recovery-types'

import {
  readDetailObject,
  readDetailNumber,
  readDetailBoolean,
  formatRecoveryNumber,
  normalizeScore,
} from '../../utils/recovery-format'

interface ReadinessFactorsProps {
  assessment?: RecoveryAssessmentResponse | null
}

export function ReadinessFactors({ assessment }: ReadinessFactorsProps) {
  const details = readDetailObject(assessment?.calculationDetails)

  const readiness = readDetailObject(details?.trainingReadiness)

  const availableWeight = readDetailNumber(readiness?.availableWeight)

  const complete = readDetailBoolean(readiness?.complete)

  const factors = [
    {
      label: 'Body Battery',
      description: "Réserve d'énergie estimée pour la journée.",
      score: readDetailNumber(readiness?.bodyBattery),
      weight: 30,
      icon: Battery,
      color: 'bg-blue-500',
    },
    {
      label: 'Sleep Score',
      description: 'Qualité globale du sommeil enregistré.',
      score: readDetailNumber(readiness?.sleepScore),
      weight: 15,
      icon: Moon,
      color: 'bg-violet-500',
    },
    {
      label: "Charge d'entraînement récente",
      description: 'Influence de la charge sportive des trois derniers jours.',
      score: readDetailNumber(readiness?.loadScore),
      weight: 25,
      icon: Activity,
      color: 'bg-amber-500',
    },
    {
      label: 'Récupération musculaire',
      description: 'Influence des courbatures déclarées.',
      score: readDetailNumber(readiness?.sorenessScore),
      weight: 20,
      icon: Dumbbell,
      color: 'bg-emerald-500',
    },
    {
      label: 'Temps de récupération',
      description: 'Temps écoulé depuis le dernier entraînement enregistré.',
      score: readDetailNumber(readiness?.restScore),
      weight: 10,
      icon: Clock,
      color: 'bg-teal-500',
    },
  ]

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-3">
          <Activity className="size-5 text-emerald-500" />
        </div>

        <div>
          <h3 className="font-semibold">Comprendre votre préparation</h3>

          <p className="text-xs text-muted-foreground">Les cinq facteurs du modèle</p>
        </div>
      </div>

      <div className="space-y-5">
        {factors.map((factor) => {
          const Icon = factor.icon
          const score = normalizeScore(factor.score)

          return (
            <div key={factor.label} className="space-y-2">
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{factor.label}</p>

                  <p className="text-xs text-muted-foreground">{factor.description}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Pondération nominale : {factor.weight} %
                  </p>
                </div>

                <span className="shrink-0 font-semibold tabular-nums">
                  {formatRecoveryNumber(score, '/100', 0)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                {score !== null && (
                  <div
                    className={`h-full rounded-full transition-all ${factor.color}`}
                    style={{ width: `${score}%` }}
                  />
                )}
              </div>

              {score === null && (
                <p className="text-xs text-muted-foreground">Critère indisponible.</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="space-y-3 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Pondération disponible</span>

          <span className="font-semibold">
            {formatRecoveryNumber(availableWeight == null ? null : availableWeight * 100, '%', 0)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Training Readiness finale</span>

          <span className="text-xl font-bold text-emerald-500">
            {formatRecoveryNumber(assessment?.trainingReadiness, '/100', 0)}
          </span>
        </div>
      </div>

      {complete === false && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />

          <p className="text-xs leading-relaxed text-muted-foreground">
            Le modèle ne dispose pas de toutes les informations nécessaires à une évaluation
            complète. Le score peut être partiel ou indisponible.
          </p>
        </div>
      )}

      <div className="space-y-2 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        <p>Un score élevé indique une préparation estimée plus favorable à l'entraînement.</p>

        <p>
          Le modèle combine des indicateurs qui peuvent partager certaines informations, notamment
          le sommeil et la Body Battery.
        </p>

        <p>Version du modèle : {assessment?.algorithmVersion ?? 'Non disponible'}.</p>
      </div>
    </section>
  )
}
