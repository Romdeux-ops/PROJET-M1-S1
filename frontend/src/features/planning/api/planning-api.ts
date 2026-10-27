import { api, unwrap } from '@/lib/api/client'

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
/**
 * Le schema OpenAPI genere par springdoc marque tous les champs comme
 * optionnels : on recast la reponse vers le contrat strict de `schemas.ts`.
 */
export const planningApi = {
  listBetween: (from: string, to: string) =>
    unwrap(api.GET('/api/planning/scheduled', { params: { query: { from, to } } })) as Promise<
      ScheduledSession[]
    >,
  listToday: () => unwrap(api.GET('/api/planning/scheduled/today')) as Promise<ScheduledSession[]>,
  listPendingValidations: () =>
    unwrap(api.GET('/api/planning/pending-validations')) as Promise<ScheduledSession[]>,
  schedule: (input: ScheduleFormInput) =>
    unwrap(
      api.POST('/api/planning/scheduled', {
        body: {
          title: input.title,
          scheduledDate: input.scheduledDate,
          notes: input.notes || undefined,
        },
      }),
    ) as Promise<ScheduledSession>,
  reschedule: (id: string, scheduledDate: string) =>
    unwrap(
      api.PATCH('/api/planning/scheduled/{scheduledSessionId}/reschedule', {
        params: { path: { scheduledSessionId: id } },
        body: { scheduledDate },
      }),
    ) as Promise<ScheduledSession>,
  skip: (id: string) =>
    unwrap(
      api.PATCH('/api/planning/scheduled/{scheduledSessionId}/skip', {
        params: { path: { scheduledSessionId: id } },
      }),
    ) as Promise<ScheduledSession>,
  complete: (id: string, workoutSessionId: string) =>
    unwrap(
      api.PATCH('/api/planning/scheduled/{scheduledSessionId}/complete', {
        params: { path: { scheduledSessionId: id } },
        body: { workoutSessionId },
      }),
    ) as Promise<ScheduledSession>,
  validate: (id: string) =>
    unwrap(
      api.PATCH('/api/planning/scheduled/{scheduledSessionId}/validate', {
        params: { path: { scheduledSessionId: id } },
      }),
    ) as Promise<ScheduledSession>,
  delete: (id: string) =>
    unwrap(
      api.DELETE('/api/planning/scheduled/{scheduledSessionId}', {
        params: { path: { scheduledSessionId: id } },
      }),
    ),
}
