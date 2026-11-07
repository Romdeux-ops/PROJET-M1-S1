import { CalendarX, Loader2, Ticket } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth/session'
import { formatShortDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useBookings, useCancelBooking } from '../hooks/use-booking'
import { BOOKING_STATUS_LABELS, type Booking } from '../schemas'
import { SlotWhen } from './slot-when'

/** Reservations de l'utilisateur, qu'il soit l'athlete ou le coach. */
export function BookingList({ from, to }: { from: string; to: string }) {
  const { data: bookings = [], isLoading } = useBookings(from, to)
  const userId = useSession((s) => s.user?.id)
  const [now] = useState(() => Date.now())

  if (isLoading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  if (bookings.length === 0) {
    return <EmptyState icon={Ticket} title="Aucune réservation à venir" />
  }

  return (
    <ul className="divide-y">
      {bookings.map((booking) => (
        <BookingItem key={booking.id} booking={booking} userId={userId} now={now} />
      ))}
    </ul>
  )
}

function BookingItem({
  booking,
  userId,
  now,
}: {
  booking: Booking
  userId: string | undefined
  now: number
}) {
  const cancel = useCancelBooking()
  const cancelled = booking.status === 'CANCELLED'
  const counterpart = booking.coachId === userId ? booking.athleteName : booking.coachName
  const cancellable = !cancelled && new Date(booking.cancellationDeadline).getTime() > now

  return (
    <li className={cn('flex items-center justify-between gap-3 py-3', cancelled && 'opacity-60')}>
      <div className="flex items-center gap-4">
        <SlotWhen startsAt={booking.startsAt} endsAt={booking.endsAt} />
        <p className="text-sm text-muted-foreground">{counterpart}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={cancelled ? 'secondary' : 'default'}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>
        {cancellable ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate(booking.id)}
          >
            {cancel.isPending ? <Loader2 className="animate-spin" /> : <CalendarX />}
            Annuler
          </Button>
        ) : (
          !cancelled && (
            <p
              className="text-xs text-muted-foreground"
              title={`Annulable jusqu'au ${formatShortDate(booking.cancellationDeadline)} à ${formatTime(booking.cancellationDeadline)}`}
            >
              Non annulable
            </p>
          )
        )}
      </div>
    </li>
  )
}
