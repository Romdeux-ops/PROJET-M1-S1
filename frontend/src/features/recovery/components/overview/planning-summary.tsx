import { CalendarCheck } from 'lucide-react'

import type { RecoveryPlanningSummaryResponse } from '../../api/recovery-types'

import { formatRecoveryPercentage } from '../../utils/recovery-format'

interface PlanningSummaryProps {
  planning?: RecoveryPlanningSummaryResponse | null
}

export function PlanningSummary({ planning }: PlanningSummaryProps) {
  const elapsed = planning?.elapsedScheduledSessions
  const adherence = planning?.adherencePercentage

  const statuses = [
    {
      label: 'Séances validées',
      value: planning?.completedSessions,
      color: 'bg-emerald-500',
    },
    {
      label: 'En attente de validation',
      value: planning?.pendingValidationSessions,
      color: 'bg-amber-500',
    },
    {
      label: 'Séances ignorées',
      value: planning?.skippedSessions,
      color: 'bg-red-500',
    },
    {
      label: 'Séances non confirmées',
      value: planning?.unconfirmedSessions,
      color: 'bg-slate-400',
    },
  ]

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <CalendarCheck className="size-5 text-primary" />
        </div>

        <div>
          <h3 className="font-semibold">Assiduité au planning</h3>

          <p className="text-xs text-muted-foreground">Semaine en cours</p>
        </div>
      </div>

      <div>
        <p className="text-3xl font-bold tabular-nums">{formatRecoveryPercentage(adherence)}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {elapsed != null && planning?.declaredCompletedSessions != null
            ? `${planning.declaredCompletedSessions} séance(s) déclarée(s) réalisée(s) sur ${elapsed} prévue(s) jusqu'à aujourd'hui`
            : 'Aucune information disponible.'}
        </p>
      </div>

      {elapsed != null && elapsed > 0 && (
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          {statuses.map((status) => {
            const count = status.value ?? 0

            return (
              <div
                key={status.label}
                className={status.color}
                style={{
                  width: `${(count / elapsed) * 100}%`,
                }}
                title={`${status.label} : ${count}`}
              />
            )
          })}
        </div>
      )}

      <div className="space-y-3">
        {statuses.map((status) => (
          <div key={status.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${status.color}`} />

              <span className="text-muted-foreground">{status.label}</span>
            </div>

            <span className="font-medium tabular-nums">{status.value ?? '—'}</span>
          </div>
        ))}

        <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
          <span className="text-muted-foreground">Séances à venir</span>

          <span className="font-medium tabular-nums">
            {planning?.futureScheduledSessions ?? '—'}
          </span>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Les séances futures sont exclues du calcul. Une séance non confirmée n'est pas considérée
        automatiquement comme une séance manquée.
      </p>
    </section>
  )
}
