import { api, unwrap } from '@/lib/api/client'

import type { Booking, Slot } from '../schemas'

/**
 * Contrat attendu du module booking (backend) :
 *   POST   /api/booking/slots                      -> Slot (201, coach)
 *   GET    /api/booking/slots?from=&to=            -> Slot[] (creneaux du coach, libres ou reserves)
 *   GET    /api/booking/slots/available?from=&to=  -> Slot[] (creneaux libres des coachs de l'athlete)
 *   DELETE /api/booking/slots/{id}                 -> 204 (coach, creneau sans reservation confirmee)
 *   POST   /api/booking/bookings                   -> Booking (201, athlete client actif du coach)
 *   GET    /api/booking/bookings?from=&to=         -> Booking[] (comme athlete ou comme coach)
 *   PATCH  /api/booking/bookings/{id}/cancel       -> Booking (jusqu'a 24 h avant le debut)
 *
 * `from` et `to` sont des jours inclus (`yyyy-mm-dd`), les horaires des instants ISO.
 */
export const bookingApi = {
  listMySlots: (from: string, to: string) =>
    unwrap(api.GET('/api/booking/slots', { params: { query: { from, to } } })) as Promise<Slot[]>,
  listAvailableSlots: (from: string, to: string) =>
    unwrap(api.GET('/api/booking/slots/available', { params: { query: { from, to } } })) as Promise<
      Slot[]
    >,
  createSlot: (startsAt: string, endsAt: string) =>
    unwrap(api.POST('/api/booking/slots', { body: { startsAt, endsAt } })) as Promise<Slot>,
  deleteSlot: (id: string) =>
    unwrap(api.DELETE('/api/booking/slots/{slotId}', { params: { path: { slotId: id } } })),
  listBookings: (from: string, to: string) =>
    unwrap(api.GET('/api/booking/bookings', { params: { query: { from, to } } })) as Promise<
      Booking[]
    >,
  book: (slotId: string) =>
    unwrap(api.POST('/api/booking/bookings', { body: { slotId } })) as Promise<Booking>,
  cancel: (id: string) =>
    unwrap(
      api.PATCH('/api/booking/bookings/{bookingId}/cancel', {
        params: { path: { bookingId: id } },
      }),
    ) as Promise<Booking>,
}
