import { http } from '@/lib/api/client'

import type { Exercise, ExerciseFormInput, ExerciseSearchFilters, MuscleGroup, Tag } from '../schemas'

function toRequestBody(input: ExerciseFormInput) {
  return {
    name: input.name,
    description: input.description || undefined,
    equipment: input.equipment || undefined,
    difficulty: input.difficulty,
    defaultRestSeconds: input.defaultRestSeconds,
    mediaUrl: input.mediaUrl || undefined,
    muscles: input.muscles,
    tagIds: input.tagIds,
    alternativeExerciseIds: input.alternativeExerciseIds,
  }
}

/**
 * Contrat attendu du module catalogue (backend) :
 *   GET    /api/catalog/muscle-groups          -> MuscleGroup[]
 *   GET    /api/catalog/tags                   -> Tag[]
 *   GET    /api/catalog/exercises               -> Exercise[]  (filtres en query string)
 *   GET    /api/catalog/exercises/{id}          -> Exercise
 *   POST   /api/catalog/exercises               -> Exercise (201, role COACH/ADMIN)
 *   PUT    /api/catalog/exercises/{id}          -> Exercise      (role COACH/ADMIN)
 *   DELETE /api/catalog/exercises/{id}          -> 204            (role COACH/ADMIN)
 */
export const catalogApi = {
  listMuscleGroups: () => http.get<MuscleGroup[]>('/api/catalog/muscle-groups'),
  listTags: () => http.get<Tag[]>('/api/catalog/tags'),
  searchExercises: (filters: ExerciseSearchFilters) => {
    const params = new URLSearchParams()
    if (filters.query) params.set('query', filters.query)
    if (filters.muscleGroupId) params.set('muscleGroupId', filters.muscleGroupId)
    if (filters.tagId) params.set('tagId', filters.tagId)
    if (filters.difficulty) params.set('difficulty', filters.difficulty)
    const qs = params.toString()
    return http.get<Exercise[]>(`/api/catalog/exercises${qs ? `?${qs}` : ''}`)
  },
  getExercise: (exerciseId: string) => http.get<Exercise>(`/api/catalog/exercises/${exerciseId}`),
  createExercise: (input: ExerciseFormInput) => http.post<Exercise>('/api/catalog/exercises', toRequestBody(input)),
  updateExercise: (exerciseId: string, input: ExerciseFormInput) =>
    http.put<Exercise>(`/api/catalog/exercises/${exerciseId}`, toRequestBody(input)),
  deleteExercise: (exerciseId: string) => http.delete(`/api/catalog/exercises/${exerciseId}`),
}
