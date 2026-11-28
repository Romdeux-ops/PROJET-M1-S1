import { Clock } from 'lucide-react'

import type { RecoveryAssessmentResponse } from '../../api/recovery-types'

import { ScoreGauge } from '../common/score-gauge'
import { DataStatusBadge } from '../common/data-status-badge'

interface OverviewScoresProps {
  assessment?: RecoveryAssessmentResponse | null
}

export function OverviewScores({ assessment }: OverviewScoresProps) {
  const calculatedAt = assessment?.calculatedAt ? new Date(assessment.calculatedAt) : null

  const formattedDate =
    calculatedAt && Number.isFinite(calculatedAt.getTime())
      ? new Intl.DateTimeFormat('fr-FR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(calculatedAt)
      : null

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Vos indicateurs du jour</h2>

        <DataStatusBadge status={assessment?.dataStatus} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <ScoreGauge kind="bodyBattery" score={assessment?.bodyBattery} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <ScoreGauge kind="sleepScore" score={assessment?.sleepScore} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <ScoreGauge kind="trainingReadiness" score={assessment?.trainingReadiness} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3.5" />

        {formattedDate
          ? `Dernier calcul : ${formattedDate}`
          : 'Aucune évaluation calculée pour le moment.'}
      </div>

      {!assessment && (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Renseignez votre sommeil et votre questionnaire quotidien, puis actualisez vos indicateurs
          pour obtenir une première évaluation.
        </p>
      )}
    </section>
  )
}
