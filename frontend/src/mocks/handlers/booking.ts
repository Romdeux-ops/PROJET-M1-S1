import { http, HttpResponse } from 'msw'

import type { Booking, Slot } from '@/features/booking/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

const CANCELLATION_NOTICE_MS = 24 * 3_600_000

/**
 * Jours `from` a `to` inclus, bornes a minuit local comme le backend le fait
 * dans le fuseau metier : comparer des jours UTC ecarterait les creneaux
 * proches de minuit.
 */
function inRange(startsAt: string, url: URL) {
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const start = new Date(startsAt).getTime()
  if (from && start < new Date(`${from}T00:00`).getTime()) return false
  if (to) {
    const end = new Date(`${to}T00:00`)
    end.setDate(end.getDate() + 1)
    if (start >= end.getTime()) return false
  }
  return true
}

function confirmedBooking(slotId: string) {
  return db.bookings.find((b) => b.slotId === slotId && b.status === 'CONFIRMED')
}

function withBooking(slot: Slot): Slot {
  const booking = confirmedBooking(slot.id)
  return booking
    ? {
        ...slot,
        bookingId: booking.id,
        athleteId: booking.athleteId,
        athleteName: booking.athleteName,
        bookingNote: booking.note,
      }
    : slot
}

const overlaps = (
  a: { startsAt: string; endsAt: string },
  b: { startsAt: string; endsAt: string },
) => a.startsAt < b.endsAt && b.startsAt < a.endsAt

export const bookingHandlers = [
  http.get('*/api/booking/slots/available', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const url = new URL(request.url)
    const coachIds = db.coachAthletes
      .filter((c) => c.athleteId === user.id && c.status === 'ACTIVE')
      .map((c) => c.coachId)
    const now = new Date().toISOString()
    return HttpResponse.json(
      db.slots
        .filter((s) => coachIds.includes(s.coachId) && s.startsAt > now && inRange(s.startsAt, url))
        .filter((s) => !confirmedBooking(s.id))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    )
  }),

  http.get('*/api/booking/slots', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('COACH')) return problem(403, 'Accès refusé.')
    const url = new URL(request.url)
    return HttpResponse.json(
      db.slots
        .filter((s) => s.coachId === user.id && inRange(s.startsAt, url))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .map(withBooking),
    )
  }),

  http.post<never, { startsAt: string; endsAt: string }>(
    '*/api/booking/slots',
    async ({ request }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Accès refusé.')
      const body = await request.json()
      if (body.startsAt <= new Date().toISOString()) {
        return problem(400, 'Un créneau doit commencer dans le futur.')
      }
      if (db.slots.some((s) => s.coachId === user.id && overlaps(s, body))) {
        return problem(409, 'Ce créneau chevauche un de vos créneaux existants.')
      }
      const slot: Slot = {
        id: crypto.randomUUID(),
        coachId: user.id,
        coachName: `${user.firstName} ${user.lastName}`,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        bookingId: null,
        athleteId: null,
        athleteName: null,
        bookingNote: null,
      }
      db.slots.push(slot)
      return HttpResponse.json(slot, { status: 201 })
    },
  ),

  http.delete<{ id: string }>('*/api/booking/slots/:id', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const index = db.slots.findIndex((s) => s.id === params.id && s.coachId === user.id)
    if (index === -1) return problem(404, 'Créneau introuvable.')
    if (confirmedBooking(params.id)) {
      return problem(409, "Ce créneau est réservé : annulez d'abord la réservation.")
    }
    db.slots.splice(index, 1)
    db.bookings = db.bookings.filter((b) => b.slotId !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/booking/bookings', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const url = new URL(request.url)
    return HttpResponse.json(
      db.bookings
        .filter(
          (b) => (b.athleteId === user.id || b.coachId === user.id) && inRange(b.startsAt, url),
        )
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    )
  }),

  http.post<never, { slotId: string; note?: string }>(
    '*/api/booking/bookings',
    async ({ request }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const body = await request.json()
      const slot = db.slots.find((s) => s.id === body.slotId)
      if (!slot) return problem(404, 'Créneau introuvable.')
      const isClient = db.coachAthletes.some(
        (c) => c.coachId === slot.coachId && c.athleteId === user.id && c.status === 'ACTIVE',
      )
      if (!isClient) {
        return problem(403, 'Seuls les athlètes suivis par ce coach peuvent réserver ses créneaux.')
      }
      if (confirmedBooking(slot.id)) {
        return problem(409, "Ce créneau vient d'être réservé par un autre athlète.")
      }
      if (
        db.bookings.some(
          (b) => b.athleteId === user.id && b.status === 'CONFIRMED' && overlaps(b, slot),
        )
      ) {
        return problem(409, 'Vous avez déjà une réservation sur cet horaire.')
      }
      const booking: Booking = {
        id: crypto.randomUUID(),
        slotId: slot.id,
        coachId: slot.coachId,
        coachName: slot.coachName,
        athleteId: user.id,
        athleteName: `${user.firstName} ${user.lastName}`,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        status: 'CONFIRMED',
        note: body.note || null,
        cancellationDeadline: new Date(
          new Date(slot.startsAt).getTime() - CANCELLATION_NOTICE_MS,
        ).toISOString(),
        cancelledAt: null,
        cancelledBy: null,
      }
      db.bookings.push(booking)
      return HttpResponse.json(booking, { status: 201 })
    },
  ),

  http.patch<{ id: string }>('*/api/booking/bookings/:id/cancel', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const booking = db.bookings.find(
      (b) => b.id === params.id && (b.athleteId === user.id || b.coachId === user.id),
    )
    if (!booking) return problem(404, 'Réservation introuvable.')
    if (booking.status === 'CANCELLED') return problem(409, 'Cette réservation est déjà annulée.')
    if (new Date(booking.cancellationDeadline) <= new Date()) {
      return problem(
        400,
        'Une réservation ne peut plus être annulée moins de 24 h avant son début.',
      )
    }
    booking.status = 'CANCELLED'
    booking.cancelledAt = new Date().toISOString()
    booking.cancelledBy = user.id
    return HttpResponse.json(booking)
  }),
]
