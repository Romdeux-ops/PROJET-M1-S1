import { http } from '@/lib/api/client'

import type { ScheduleFormInput, ScheduledSession } from '../schemas'

/**
 * Contrat attendu du module planning (backend) :
 *   GET    /api/planning/scheduled?from=&to=                  -> ScheduledSession[]
 *   GET    /api/planning/scheduled/today                       -> ScheduledSession[]
 *   POST   /api/planning/scheduled                              -> ScheduledSession (201)
 *   PATCH  /api/planning/scheduled/{id}/reschedule               -> ScheduledSession
 *   PATCH  /api/planning/scheduled/{id}/skip                      -> ScheduledSession
 *   PATCH  /api/planning/scheduled/{id}/complete                  -> ScheduledSession
 *   PATCH  /api/planning/scheduled/{id}/validate                  -> ScheduledSession (coach actif de l'athlete)
 *   GET    /api/planning/pending-validations                      -> ScheduledSession[] (coach)
 *   DELETE /api/planning/scheduled/{id}                            -> 204
 */
export const planningApi = {
  listBetween: (from: string, to: string) =>
    http.get<ScheduledSession[]>(`/api/planning/scheduled?from=${from}&to=${to}`),
  listToday: () => http.get<ScheduledSession[]>('/api/planning/scheduled/today'),
  listPendingValidations: () => http.get<ScheduledSession[]>('/api/planning/pending-validations'),
  schedule: (input: ScheduleFormInput) =>
    http.post<ScheduledSession>('/api/planning/scheduled', {
      title: input.title,
      scheduledDate: input.scheduledDate,
      notes: input.notes || undefined,
    }),
  reschedule: (id: string, scheduledDate: string) =>
    http.patch<ScheduledSession>(`/api/planning/scheduled/${id}/reschedule`, { scheduledDate }),
  skip: (id: string) => http.patch<ScheduledSession>(`/api/planning/scheduled/${id}/skip`),
  complete: (id: string, workoutSessionId: string) =>
    http.patch<ScheduledSession>(`/api/planning/scheduled/${id}/complete`, { workoutSessionId }),
  validate: (id: string) => http.patch<ScheduledSession>(`/api/planning/scheduled/${id}/validate`),
  delete: (id: string) => http.delete(`/api/planning/scheduled/${id}`),
}
