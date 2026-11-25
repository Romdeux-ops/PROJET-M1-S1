import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Hourglass,
  Loader2,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import { useDeleteScheduled, useSkip } from '../hooks/use-planning'
import { STATUS_LABELS, type ScheduledSession, type ScheduledStatus } from '../schemas'
import { CompleteSessionForm } from './complete-session-form'
import { RescheduleDialog } from './reschedule-dialog'

const TONES: Record<ScheduledStatus, { icon: LucideIcon; bar: string; chip: string }> = {
  PLANNED: { icon: CalendarClock, bar: 'bg-primary', chip: 'bg-primary/10 text-primary' },
  PENDING_VALIDATION: { icon: Hourglass, bar: 'bg-warning', chip: 'bg-warning/15 text-warning' },
  DONE: { icon: CheckCircle2, bar: 'bg-success', chip: 'bg-success/15 text-success' },
  SKIPPED: { icon: Ban, bar: 'bg-muted-foreground/40', chip: 'bg-muted text-muted-foreground' },
}

export function ScheduledItem({ session }: { session: ScheduledSession }) {
  const skip = useSkip()
  const deleteScheduled = useDeleteScheduled()
  const [completeOpen, setCompleteOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const tone = TONES[session.status]
  const Icon = tone.icon
  const busy = skip.isPending || deleteScheduled.isPending

  return (
    <article
      data-status={session.status}
      className={cn(
        'relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-card p-4 pl-5',
        'transition-all hover:border-primary/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between',
        session.status === 'SKIPPED' && 'opacity-70',
      )}
    >
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', tone.bar)} />

      <div className="flex min-w-0 items-start gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tone.chip)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="truncate font-semibold">{session.title}</p>
          {(session.athleteName || session.notes) && (
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {[session.athleteName, session.notes].filter(Boolean).join(' · ')}
            </p>
          )}
          <Badge variant="outline" className={cn('border-transparent', tone.chip)}>
            {STATUS_LABELS[session.status]}
          </Badge>
        </div>
      </div>

      {session.status === 'PLANNED' && (
        <div className="flex items-center gap-2 sm:shrink-0">
          <Button type="button" size="sm" onClick={() => setCompleteOpen(true)}>
            <CheckCircle2 /> Terminer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Autres actions pour ${session.title}`}
                disabled={busy}
              >
                {busy ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setRescheduleOpen(true)}>
                <CalendarClock /> Replanifier
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => skip.mutate(session.id)}>
                <Ban /> Sauter cette séance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => deleteScheduled.mutate(session.id)}
              >
                <Trash2 /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {session.status === 'PENDING_VALIDATION' && (
        <p className="text-xs text-muted-foreground sm:max-w-44 sm:text-right">
          En attente de validation par votre coach.
        </p>
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
      <RescheduleDialog session={session} open={rescheduleOpen} onOpenChange={setRescheduleOpen} />
    </article>
  )
}
