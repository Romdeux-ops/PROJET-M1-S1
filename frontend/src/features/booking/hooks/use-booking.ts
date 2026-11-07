import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { bookingApi } from '../api/booking-api'
import type { SlotFormInput } from '../schemas'

export const bookingKeys = {
  all: ['booking'] as const,
  mySlots: (from: string, to: string) => [...bookingKeys.all, 'my-slots', from, to] as const,
  available: (from: string, to: string) => [...bookingKeys.all, 'available', from, to] as const,
  bookings: (from: string, to: string) => [...bookingKeys.all, 'bookings', from, to] as const,
}

export function useMySlots(from: string, to: string) {
  return useQuery({
    queryKey: bookingKeys.mySlots(from, to),
    queryFn: () => bookingApi.listMySlots(from, to),
  })
}

export function useAvailableSlots(from: string, to: string) {
  return useQuery({
    queryKey: bookingKeys.available(from, to),
    queryFn: () => bookingApi.listAvailableSlots(from, to),
  })
}

export function useBookings(from: string, to: string) {
  return useQuery({
    queryKey: bookingKeys.bookings(from, to),
    queryFn: () => bookingApi.listBookings(from, to),
  })
}

/** Le formulaire saisit une heure locale ; l'API recoit des instants ISO. */
export function slotInstants({ date, startTime, durationMinutes }: SlotFormInput) {
  const start = new Date(`${date}T${startTime}`)
  const end = new Date(start.getTime() + Number(durationMinutes) * 60_000)
  return { startsAt: start.toISOString(), endsAt: end.toISOString() }
}

export function useCreateSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SlotFormInput) => {
      const { startsAt, endsAt } = slotInstants(input)
      return bookingApi.createSlot(startsAt, endsAt)
    },
    meta: { successMessage: 'Créneau publié', silentError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}

export function useDeleteSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingApi.deleteSlot(id),
    meta: { successMessage: 'Créneau supprimé' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}

export function useBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slotId: string) => bookingApi.book(slotId),
    meta: { successMessage: 'Créneau réservé' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
    // Un 409 signifie souvent que le creneau vient d'etre pris : rafraichir la liste.
    onError: () => queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    meta: { successMessage: 'Réservation annulée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}
