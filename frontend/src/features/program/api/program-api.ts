import { http } from '@/lib/api/client'

import type {
  DayFormInput,
  ExerciseEntryFormInput,
  Program,
  ProgramFormInput,
  ProgramSearchFilters,
} from '../schemas'

interface PositionUpdate {
  id: string
  position: number
}

function toProgramBody(input: ProgramFormInput) {
  return {
    title: input.title,
    description: input.description || undefined,
    category: input.category,
    level: input.level,
    visibility: input.visibility,
  }
}

/**
 * Contrat attendu du module programmes (backend) :
 *   GET    /api/programs                                  -> Program[] (filtres en query string)
 *   GET    /api/programs/{id}                              -> Program
 *   GET    /api/programs/shared/{token}                    -> Program (public, sans auth)
 *   POST   /api/programs                                   -> Program (201)
 *   PUT    /api/programs/{id}                               -> Program      (proprietaire)
 *   DELETE /api/programs/{id}                               -> 204            (proprietaire)
 *   POST   /api/programs/{id}/duplicate                     -> Program (201)
 *   POST   /api/programs/{id}/days                          -> Program      (proprietaire)
 *   DELETE /api/programs/{id}/days/{dayId}                  -> Program      (proprietaire)
 *   POST   /api/programs/{id}/days/{dayId}/exercises        -> Program      (proprietaire)
 *   DELETE /api/programs/{id}/days/{dayId}/exercises/{eid}  -> Program      (proprietaire)
 *   POST   /api/programs/{id}/ratings                       -> Program      (non-proprietaire, programme public)
 */
export const programApi = {
  search: (filters: ProgramSearchFilters) => {
    const params = new URLSearchParams()
    if (filters.mineOnly) params.set('mineOnly', 'true')
    if (filters.category) params.set('category', filters.category)
    if (filters.level) params.set('level', filters.level)
    const qs = params.toString()
    return http.get<Program[]>(`/api/programs${qs ? `?${qs}` : ''}`)
  },
  get: (programId: string) => http.get<Program>(`/api/programs/${programId}`),
  getShared: (shareToken: string) => http.get<Program>(`/api/programs/shared/${shareToken}`),
  create: (input: ProgramFormInput) => http.post<Program>('/api/programs', toProgramBody(input)),
  update: (programId: string, input: ProgramFormInput) =>
    http.put<Program>(`/api/programs/${programId}`, toProgramBody(input)),
  delete: (programId: string) => http.delete(`/api/programs/${programId}`),
  duplicate: (programId: string) => http.post<Program>(`/api/programs/${programId}/duplicate`),
  addDay: (programId: string, input: DayFormInput) => http.post<Program>(`/api/programs/${programId}/days`, input),
  deleteDay: (programId: string, dayId: string) =>
    http.delete<Program>(`/api/programs/${programId}/days/${dayId}`),
  reorderDays: (programId: string, updates: PositionUpdate[]) =>
    http.patch<Program>(`/api/programs/${programId}/days/positions`, updates),
  addExercise: (programId: string, dayId: string, input: ExerciseEntryFormInput) =>
    http.post<Program>(`/api/programs/${programId}/days/${dayId}/exercises`, {
      exerciseId: input.exerciseId,
      sets: input.sets,
      reps: input.reps,
      restSeconds: input.restSeconds,
      notes: input.notes || undefined,
    }),
  deleteExercise: (programId: string, dayId: string, exerciseEntryId: string) =>
    http.delete<Program>(`/api/programs/${programId}/days/${dayId}/exercises/${exerciseEntryId}`),
  rate: (programId: string, stars: number, comment?: string) =>
    http.post<Program>(`/api/programs/${programId}/ratings`, { stars, comment }),
}
