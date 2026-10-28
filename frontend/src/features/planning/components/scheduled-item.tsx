import { Ban, CalendarClock, CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { useDeleteScheduled, useReschedule, useSkip } from '../hooks/use-planning'
import { STATUS_LABELS, type ScheduledSession } from '../schemas'
import { CompleteSessionForm } from './complete-session-form'

export function ScheduledItem({ session }: { session: ScheduledSession }) {
  const reschedule = useReschedule()
  const skip = useSkip()
  const deleteScheduled = useDeleteScheduled()
  const [completeOpen, setCompleteOpen] = useState(false)

  return (
    <div className="space-y-2 rounded-md border p-2.5 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate font-medium">{session.title}</p>
        <Badge
          variant={
            session.status === 'DONE'
              ? 'default'
              : session.status === 'SKIPPED'
                ? 'secondary'
                : session.status === 'PENDING_VALIDATION'
                  ? 'secondary'
                  : 'outline'
          }
          className="shrink-0"
        >
          {STATUS_LABELS[session.status]}
        </Badge>
      </div>

      <input
        type="date"
        className="hidden"
        id={`reschedule-${session.id}`}
        onChange={(e) => {
          if (e.target.value) reschedule.mutate({ id: session.id, scheduledDate: e.target.value })
        }}
      />

      {session.status === 'PLANNED' && (
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="outline" size="sm" onClick={() => setCompleteOpen(true)}>
            <CheckCircle2 className="size-3.5" /> Terminer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              (
                document.getElementById(`reschedule-${session.id}`) as HTMLInputElement | null
              )?.showPicker()
            }
          >
            <CalendarClock className="size-3.5" /> Replanifier
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={skip.isPending}
            onClick={() => skip.mutate(session.id)}
          >
            {skip.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Ban className="size-3.5" />
            )}
            Sauter
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={deleteScheduled.isPending}
            onClick={() => deleteScheduled.mutate(session.id)}
          >
            {deleteScheduled.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Supprimer
          </Button>
        </div>
      )}

      {session.status === 'PENDING_VALIDATION' && (
        <p className="text-xs text-muted-foreground">En attente de validation par votre coach.</p>
      )}

      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme terminée</DialogTitle>
          </DialogHeader>
          <CompleteSessionForm
            scheduledSessionId={session.id}
            onDone={() => setCompleteOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
