import { CalendarCheck, CalendarClock, Loader2 } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'

import { useAvailableSlots, useBook } from '../hooks/use-booking'
import { SlotWhen } from './slot-when'

export function AvailableSlotList({ from, to }: { from: string; to: string }) {
  const { data: slots = [], isLoading } = useAvailableSlots(from, to)
  const book = useBook()

  if (isLoading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  if (slots.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Aucun créneau disponible"
        description="Vos coachs n'ont pas de créneau libre pour le moment."
      />
    )
  }

  return (
    <ul className="divide-y">
      {slots.map((slot) => {
        const pending = book.isPending && book.variables === slot.id
        return (
          <li key={slot.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-4">
              <SlotWhen startsAt={slot.startsAt} endsAt={slot.endsAt} />
              <p className="text-sm text-muted-foreground">{slot.coachName}</p>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={book.isPending}
              onClick={() => book.mutate(slot.id)}
            >
              {pending ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
              Réserver
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
