import { useState } from 'react'
import { Moon, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { ErrorState, PageLoader } from '@/components/feedback'

import type { RecoveryDateRange, SleepLogResponse } from '../../api/recovery-types'

import { useSleepLogs } from '../../hooks/use-recovery'

import { useDeleteSleepLog } from '../../hooks/use-recovery-mutations'

import {
  formatRecoveryChartDate,
  formatRecoveryDuration,
  formatRecoveryNumber,
} from '../../utils/recovery-format'

import { SleepLogDialog } from '../forms/sleep-log-dialog'

interface SleepLogHistoryProps {
  range: RecoveryDateRange
  timeZone?: string | null
}

function formatTime(value?: string | null, timeZone?: string | null): string {
  if (!value) return '—'

  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone ?? undefined,
  }).format(date)
}

export function SleepLogHistory({ range, timeZone }: SleepLogHistoryProps) {
  const query = useSleepLogs(range)
  const deleteMutation = useDeleteSleepLog()

  const [selectedLog, setSelectedLog] = useState<SleepLogResponse | null>(null)

  const logs = [...(query.data ?? [])].sort((a, b) =>
    (b.sleepDate ?? '').localeCompare(a.sleepDate ?? ''),
  )

  async function handleDelete() {
    if (!selectedLog?.id) return

    try {
      await deleteMutation.mutateAsync(selectedLog.id)
      setSelectedLog(null)
    } catch {
      // L'erreur est affichée par le MutationCache.
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Journal des nuits</h3>

          <p className="text-sm text-muted-foreground">Consultez et gérez vos enregistrements.</p>
        </div>

        <SleepLogDialog />
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
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <Moon className="size-8 text-muted-foreground" />

          <p className="font-medium">Aucune nuit enregistrée</p>

          <p className="text-sm text-muted-foreground">
            Aucun journal de sommeil sur cette période.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, index) => (
            <article key={log.id ?? index} className="space-y-4 rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-violet-500/10 p-3">
                    <Moon className="size-5 text-violet-500" />
                  </div>

                  <div>
                    <h4 className="font-medium">
                      {log.sleepDate ? formatRecoveryChartDate(log.sleepDate) : 'Date indisponible'}
                    </h4>

                    <p className="text-xs text-muted-foreground">
                      {formatTime(log.bedtime, timeZone)}
                      {' — '}
                      {formatTime(log.wakeTime, timeZone)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">
                    {formatRecoveryDuration(log.estimatedSleepMinutes)}
                  </p>

                  {log.sleepDurationApproximate && (
                    <p className="text-xs text-muted-foreground">Durée approximative</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Qualité</p>

                  <p className="font-medium">{formatRecoveryNumber(log.sleepQuality, '/10', 0)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Réveils</p>

                  <p className="font-medium">{log.nightAwakenings ?? '—'}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Temps éveillé</p>

                  <p className="font-medium">{formatRecoveryDuration(log.awakeMinutes)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Temps au lit</p>

                  <p className="font-medium">{formatRecoveryDuration(log.timeInBedMinutes)}</p>
                </div>
              </div>

              {log.notes && (
                <p className="rounded-lg bg-muted/50 p-3 text-sm break-words whitespace-pre-wrap text-muted-foreground">
                  {log.notes}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
                {log.id && <SleepLogDialog sleepLog={log} />}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!log.id || deleteMutation.isPending}
                  className="text-destructive"
                  onClick={() => setSelectedLog(log)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Supprimer
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={selectedLog !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setSelectedLog(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer cette nuit ?</DialogTitle>

            <DialogDescription>
              Cette action supprimera définitivement l'enregistrement de sommeil sélectionné. Les
              évaluations concernées seront recalculées.
            </DialogDescription>
          </DialogHeader>

          {selectedLog?.sleepDate && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              Nuit du {formatRecoveryChartDate(selectedLog.sleepDate)}
              {' — '}
              {formatRecoveryDuration(selectedLog.estimatedSleepMinutes)}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setSelectedLog(null)}
            >
              Annuler
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={!selectedLog?.id || deleteMutation.isPending}
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
