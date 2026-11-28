import { useState } from 'react'

import { HeartPulse, Battery, Activity, Brain, Dumbbell, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { ErrorState, PageLoader } from '@/components/feedback'

import type { RecoveryDateRange, RecoveryCheckinResponse } from '../../api/recovery-types'

import { useRecoveryCheckins } from '../../hooks/use-recovery'

import { useDeleteRecoveryCheckin } from '../../hooks/use-recovery-mutations'

import { formatRecoveryChartDate, formatRecoveryNumber } from '../../utils/recovery-format'

import { RecoveryCheckinDialog } from '../forms/recovery-checkin-dialog'

interface CheckinHistoryProps {
  range: RecoveryDateRange
}

export function CheckinHistory({ range }: CheckinHistoryProps) {
  const query = useRecoveryCheckins(range)
  const deleteMutation = useDeleteRecoveryCheckin()

  const [selectedCheckin, setSelectedCheckin] = useState<RecoveryCheckinResponse | null>(null)

  const checkins = [...(query.data ?? [])].sort((a, b) =>
    (b.checkinDate ?? '').localeCompare(a.checkinDate ?? ''),
  )

  async function handleDelete() {
    if (!selectedCheckin?.checkinDate) return

    try {
      await deleteMutation.mutateAsync(selectedCheckin.checkinDate)

      setSelectedCheckin(null)
    } catch {
      // L'erreur est affichée par le MutationCache.
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Historique du ressenti quotidien</h3>

          <p className="text-sm text-muted-foreground">
            Retrouvez vos questionnaires de récupération.
          </p>
        </div>

        <RecoveryCheckinDialog date={range.to} />
      </div>

      {query.isPending ? (
        <PageLoader />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : checkins.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <HeartPulse className="size-8 text-muted-foreground" />

          <p className="font-medium">Aucun questionnaire enregistré</p>

          <p className="text-sm text-muted-foreground">
            Aucun ressenti quotidien sur cette période.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkins.map((checkin, index) => {
            const metrics = [
              {
                label: 'Énergie',
                value: checkin.energyLevel,
                icon: Battery,
                color: 'text-blue-500',
              },
              {
                label: 'Fatigue',
                value: checkin.fatigueLevel,
                icon: Activity,
                color: 'text-amber-500',
              },
              {
                label: 'Stress',
                value: checkin.stressLevel,
                icon: Brain,
                color: 'text-violet-500',
              },
              {
                label: 'Courbatures',
                value: checkin.muscleSoreness,
                icon: Dumbbell,
                color: 'text-emerald-500',
              },
            ]

            return (
              <article
                key={checkin.id ?? checkin.checkinDate ?? index}
                className="space-y-4 rounded-xl border bg-card p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <HeartPulse className="size-5 text-blue-500" />
                  </div>

                  <div>
                    <h4 className="font-medium">
                      {checkin.checkinDate
                        ? formatRecoveryChartDate(checkin.checkinDate)
                        : 'Date indisponible'}
                    </h4>

                    <p className="text-xs text-muted-foreground">Questionnaire quotidien</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {metrics.map((metric) => {
                    const Icon = metric.icon

                    return (
                      <div key={metric.label} className="space-y-2 rounded-lg bg-muted/50 p-3">
                        <Icon className={`size-4 ${metric.color}`} />

                        <p className="text-xs text-muted-foreground">{metric.label}</p>

                        <p className="text-lg font-semibold tabular-nums">
                          {formatRecoveryNumber(metric.value, '/10', 0)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {checkin.notes && (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm break-words whitespace-pre-wrap text-muted-foreground">
                    {checkin.notes}
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
                  {checkin.checkinDate && (
                    <RecoveryCheckinDialog checkin={checkin} date={checkin.checkinDate} />
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    disabled={!checkin.checkinDate || deleteMutation.isPending}
                    onClick={() => setSelectedCheckin(checkin)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Supprimer
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Dialog
        open={selectedCheckin !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setSelectedCheckin(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer ce questionnaire ?</DialogTitle>

            <DialogDescription>
              Cette action supprimera définitivement le ressenti quotidien sélectionné. Les
              évaluations concernées seront recalculées.
            </DialogDescription>
          </DialogHeader>

          {selectedCheckin?.checkinDate && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              Questionnaire du {formatRecoveryChartDate(selectedCheckin.checkinDate)}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setSelectedCheckin(null)}
            >
              Annuler
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={!selectedCheckin?.checkinDate || deleteMutation.isPending}
              onClick={() => {
                void handleDelete()
              }}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
