import { api, unwrap } from '@/lib/api/client'

import type { AddSetInput, CreateSessionInput, PersonalRecord, TrainingSession } from '../schemas'

function toSessionBody(input: CreateSessionInput) {
  return {
    title: input.title,
    performedAt: new Date(input.performedAt).toISOString(),
    durationMinutes: input.durationMinutes,
    notes: input.notes || undefined,
  }
}

/**
 * Contrat du module training (backend) :
 *   GET    /api/training/sessions                   -> PageResponse<TrainingSession> (tri date desc ; .content extrait cote client, size=100)
 *   GET    /api/training/sessions/{id}               -> TrainingSession
 *   POST   /api/training/sessions                    -> TrainingSession (201)
 *   DELETE /api/training/sessions/{id}               -> 204
 *   POST   /api/training/sessions/{id}/sets          -> TrainingSession (ajoute une serie, met a jour les records)
 *   DELETE /api/training/sessions/{id}/sets/{setId}  -> TrainingSession
 *   GET    /api/training/personal-records            -> PersonalRecord[]
 */
export const trainingApi = {
  list: async () => {
    const page = await unwrap(
      api.GET('/api/training/sessions', { params: { query: { size: 100 } } }),
    )
    return (page.content ?? []) as TrainingSession[]
  },
  get: (sessionId: string) =>
    unwrap(
      api.GET('/api/training/sessions/{sessionId}', { params: { path: { sessionId } } }),
    ) as Promise<TrainingSession>,
  create: (input: CreateSessionInput) =>
    unwrap(
      api.POST('/api/training/sessions', { body: toSessionBody(input) }),
    ) as Promise<TrainingSession>,
  remove: (sessionId: string) =>
    unwrap(api.DELETE('/api/training/sessions/{sessionId}', { params: { path: { sessionId } } })),
  addSet: (sessionId: string, input: AddSetInput) =>
    unwrap(
      api.POST('/api/training/sessions/{sessionId}/sets', {
        params: { path: { sessionId } },
        body: input,
      }),
    ) as Promise<TrainingSession>,
  removeSet: (sessionId: string, setId: string) =>
    unwrap(
      api.DELETE('/api/training/sessions/{sessionId}/sets/{setId}', {
        params: { path: { sessionId, setId } },
      }),
    ) as Promise<TrainingSession>,
  personalRecords: () =>
    unwrap(api.GET('/api/training/personal-records')) as Promise<PersonalRecord[]>,
}
