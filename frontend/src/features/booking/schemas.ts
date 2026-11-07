import { z } from 'zod'

export const bookingStatuses = ['CONFIRMED', 'CANCELLED'] as const
export type BookingStatus = (typeof bookingStatuses)[number]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
}

/** Creneau publie par un coach. Les champs `booking*` / `athlete*` sont nuls s'il est libre. */
export interface Slot {
  id: string
  coachId: string
  coachName: string
  startsAt: string
  endsAt: string
  bookingId: string | null
  athleteId: string | null
  athleteName: string | null
  bookingNote: string | null
}

export interface Booking {
  id: string
  slotId: string
  coachId: string
  coachName: string
  athleteId: string
  athleteName: string
  startsAt: string
  endsAt: string
  status: BookingStatus
  note: string | null
  /** Au-dela de cet instant, la reservation n'est plus annulable. */
  cancellationDeadline: string
  cancelledAt: string | null
  cancelledBy: string | null
}

export const SLOT_DURATIONS = ['30', '45', '60', '90', '120'] as const

export const slotFormSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "L'heure est requise"),
  durationMinutes: z.enum(SLOT_DURATIONS),
})
export type SlotFormInput = z.infer<typeof slotFormSchema>
