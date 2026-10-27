import { api, http, unwrap } from '@/lib/api/client'

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
  get: (sessionId: string) => http.get<TrainingSession>(`/api/training/sessions/${sessionId}`),
  create: (input: CreateSessionInput) =>
    http.post<TrainingSession>('/api/training/sessions', toSessionBody(input)),
  remove: (id: string) => http.delete(`/api/training/sessions/${id}`),
  addSet: (sessionId: string, input: AddSetInput) =>
    http.post<TrainingSession>(`/api/training/sessions/${sessionId}/sets`, input),
  removeSet: (sessionId: string, setId: string) =>
    http.delete<TrainingSession>(`/api/training/sessions/${sessionId}/sets/${setId}`),
  personalRecords: () => http.get<PersonalRecord[]>('/api/training/personal-records'),
}
