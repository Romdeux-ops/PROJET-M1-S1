import { Activity, Gauge, Footprints, Moon, Info } from 'lucide-react'

import { RECOMMENDATION_LABELS, type RecoveryRecommendation } from '../../api/recovery-types'

interface RecommendationCardProps {
  recommendation?: RecoveryRecommendation | null
}

const RECOMMENDATION_CONFIG = {
  NORMAL_TRAINING: {
    icon: Activity,
    iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    description:
      'Les indicateurs disponibles sont favorables. Vous pouvez envisager votre entraînement habituel en tenant compte de votre ressenti.',
  },

  MODERATE_TRAINING: {
    icon: Gauge,
    iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    description:
      'Privilégiez une intensité modérée et évitez les efforts maximaux si vous ressentez de la fatigue.',
  },

  LIGHT_ACTIVITY: {
    icon: Footprints,
    iconClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    description:
      'Privilégiez une activité douce, comme la marche ou des exercices de mobilité, selon votre ressenti.',
  },

  REST: {
    icon: Moon,
    iconClass: 'bg-red-500/10 text-red-600 dark:text-red-400',
    description:
      'Les indicateurs suggèrent de privilégier la récupération avant une séance exigeante.',
  },
} as const

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  if (!recommendation) {
    return (
      <section className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-muted p-3">
            <Info className="size-6 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold">Recommandation indisponible</h3>

            <p className="text-sm text-muted-foreground">
              Renseignez vos données de sommeil, votre questionnaire quotidien et vos informations
              d'entraînement pour obtenir une recommandation.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const config = RECOMMENDATION_CONFIG[recommendation]
  const Icon = config.icon

  return (
    <section className="rounded-xl border bg-card p-5">
      <p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Recommandation du jour
      </p>

      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-3 ${config.iconClass}`}>
          <Icon className="size-6" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">{RECOMMENDATION_LABELS[recommendation]}</h3>

          <p className="text-sm leading-relaxed text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Cette recommandation est issue d'un modèle expérimental. Elle ne constitue pas un avis
          médical ni une autorisation à pratiquer une activité sportive.
        </p>
      </div>
    </section>
  )
}
