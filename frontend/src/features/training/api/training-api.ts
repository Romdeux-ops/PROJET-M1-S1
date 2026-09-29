import { http } from '@/lib/api/client'

import type { CreateSessionInput, SessionFilters, TrainingSession } from '../schemas'

/**
 * Contrat attendu du module training (backend) :
 *   GET    /api/training/sessions?type=STRENGTH  -> TrainingSession[] (tri date desc)
 *   POST   /api/training/sessions                -> TrainingSession (201)
 *   DELETE /api/training/sessions/{id}           -> 204
 *
 * Quand le backend expose ces endpoints : `npm run gen:api`, puis remplacer `http`
 * par le client type `api` (voir src/lib/api/client.ts).
 */
export const trainingApi = {
  list: (filters: SessionFilters = {}) =>
    http.get<TrainingSession[]>('/api/training/sessions', { query: { ...filters } }),
  create: (input: CreateSessionInput) =>
    http.post<TrainingSession>('/api/training/sessions', input),
  remove: (id: string) => http.delete(`/api/training/sessions/${id}`),
}
