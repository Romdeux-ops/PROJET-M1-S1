import { CalendarClock, Loader2, Trash2 } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { useDeleteSlot, useMySlots } from '../hooks/use-booking'
import { SlotWhen } from './slot-when'

/** Creneaux du coach : un creneau reserve s'annule depuis la liste des reservations. */
export function CoachSlotList({ from, to }: { from: string; to: string }) {
  const { data: slots = [], isLoading } = useMySlots(from, to)
  const deleteSlot = useDeleteSlot()

  if (isLoading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  if (slots.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Aucun créneau publié"
        description="Publiez vos disponibilités pour que vos athlètes puissent réserver."
      />
    )
  }

  return (
    <ul className="divide-y">
      {slots.map((slot) => (
        <li key={slot.id} className="flex items-center justify-between gap-3 py-3">
          <SlotWhen startsAt={slot.startsAt} endsAt={slot.endsAt} />
          <div className="flex items-center gap-2">
            {slot.bookingId ? (
              <Badge>Réservé par {slot.athleteName}</Badge>
            ) : (
              <>
                <Badge variant="outline">Libre</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Supprimer le créneau"
                  className="text-destructive hover:text-destructive"
                  disabled={deleteSlot.isPending && deleteSlot.variables === slot.id}
                  onClick={() => deleteSlot.mutate(slot.id)}
                >
                  <Trash2 />
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
