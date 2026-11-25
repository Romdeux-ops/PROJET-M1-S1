import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useReschedule } from '../hooks/use-planning'
import type { ScheduledSession } from '../schemas'

interface RescheduleDialogProps {
  session: ScheduledSession
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RescheduleDialog({ session, open, onOpenChange }: RescheduleDialogProps) {
  const reschedule = useReschedule()
  const [date, setDate] = useState(session.scheduledDate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Replanifier la séance</DialogTitle>
          <DialogDescription>{session.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`reschedule-${session.id}`}>Nouvelle date</Label>
          <Input
            id={`reschedule-${session.id}`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            disabled={!date || date === session.scheduledDate || reschedule.isPending}
            onClick={() =>
              reschedule.mutate(
                { id: session.id, scheduledDate: date },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            Replanifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
