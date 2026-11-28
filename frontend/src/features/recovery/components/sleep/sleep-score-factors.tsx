import { Clock, Moon, CalendarDays, Eye, Info } from 'lucide-react'

import type { RecoveryAssessmentResponse } from '../../api/recovery-types'

import {
  readDetailObject,
  readDetailNumber,
  readDetailBoolean,
  formatRecoveryNumber,
  normalizeScore,
} from '../../utils/recovery-format'

interface SleepScoreFactorsProps {
  assessment?: RecoveryAssessmentResponse | null
}

export function SleepScoreFactors({ assessment }: SleepScoreFactorsProps) {
  const details = readDetailObject(assessment?.calculationDetails)

  const sleep = readDetailObject(details?.sleep)

  const availableWeight = readDetailNumber(sleep?.availableWeight)

  const complete = readDetailBoolean(sleep?.complete)

  const factors = [
    {
      label: 'Durée du sommeil',
      description: 'Comparaison de la durée estimée avec votre objectif personnel.',
      score: readDetailNumber(sleep?.durationScore),
      weight: 40,
      icon: Clock,
    },
    {
      label: 'Qualité déclarée',
      description: 'Évaluation subjective de la qualité de votre nuit.',
      score: readDetailNumber(sleep?.qualityScore),
      weight: 30,
      icon: Moon,
    },
    {
      label: 'Régularité des horaires',
      description: 'Comparaison avec les horaires des nuits précédentes.',
      score: readDetailNumber(sleep?.regularityScore),
      weight: 20,
      icon: CalendarDays,
    },
    {
      label: 'Réveils nocturnes',
      description: 'Influence des interruptions déclarées pendant la nuit.',
      score: readDetailNumber(sleep?.awakeningsScore),
      weight: 10,
      icon: Eye,
    },
  ]

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-violet-500/10 p-3">
          <Moon className="size-5 text-violet-500" />
        </div>

        <div>
          <h3 className="font-semibold">Comprendre votre Sleep Score</h3>

          <p className="text-xs text-muted-foreground">Les quatre critères du modèle</p>
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
                    className="h-full rounded-full bg-violet-500 transition-all"
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
            {formatRecoveryNumber(availableWeight === null ? null : availableWeight * 100, '%', 0)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Sleep Score final</span>

          <span className="text-xl font-bold text-violet-500">
            {formatRecoveryNumber(assessment?.sleepScore, '/100', 0)}
          </span>
        </div>
      </div>

      {complete === false && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />

          <p className="text-xs leading-relaxed text-muted-foreground">
            Certaines informations sont manquantes. Le modèle adapte le calcul aux critères
            disponibles. Le score reste une estimation partielle.
          </p>
        </div>
      )}

      <div className="space-y-2 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        <p>La régularité nécessite au moins trois nuits précédentes exploitables.</p>

        <p>
          Le Sleep Score FitCoach ne mesure pas les phases de sommeil profond, léger ou paradoxal.
          Il repose sur les informations déclarées.
        </p>

        <p>Version du modèle : {assessment?.algorithmVersion ?? 'Non disponible'}.</p>
      </div>
    </section>
  )
}
