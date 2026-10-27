import { api, unwrap } from '@/lib/api/client'

import type {
  Exercise,
  ExerciseFormInput,
  ExerciseSearchFilters,
  MuscleGroup,
  Tag,
} from '../schemas'

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
 *   GET    /api/catalog/exercises               -> PageResponse<Exercise> (filtres en query string ; .content extrait cote client, size=100)
 *   GET    /api/catalog/exercises/{id}          -> Exercise
 *   POST   /api/catalog/exercises               -> Exercise (201, role COACH/ADMIN)
 *   PUT    /api/catalog/exercises/{id}          -> Exercise      (role COACH/ADMIN)
 *   DELETE /api/catalog/exercises/{id}          -> 204            (role COACH/ADMIN)
 */
/**
 * Le schema OpenAPI genere par springdoc marque tous les champs comme
 * optionnels (il ne declare pas `required`). Le contrat reel du backend est
 * plus strict (voir `schemas.ts`) : on recast donc la reponse une fois
 * validee au niveau HTTP, plutot que de propager des `| undefined` partout.
 */
export const catalogApi = {
  listMuscleGroups: () => unwrap(api.GET('/api/catalog/muscle-groups')) as Promise<MuscleGroup[]>,
  listTags: () => unwrap(api.GET('/api/catalog/tags')) as Promise<Tag[]>,
  searchExercises: async (filters: ExerciseSearchFilters) => {
    const page = await unwrap(
      api.GET('/api/catalog/exercises', {
        params: {
          query: {
            query: filters.query,
            muscleGroupId: filters.muscleGroupId,
            tagId: filters.tagId,
            difficulty: filters.difficulty,
            size: 100,
          },
        },
      }),
    )
    return (page.content ?? []) as Exercise[]
  },
  getExercise: (exerciseId: string) =>
    unwrap(
      api.GET('/api/catalog/exercises/{exerciseId}', { params: { path: { exerciseId } } }),
    ) as Promise<Exercise>,
  createExercise: (input: ExerciseFormInput) =>
    unwrap(api.POST('/api/catalog/exercises', { body: toRequestBody(input) })) as Promise<Exercise>,
  updateExercise: (exerciseId: string, input: ExerciseFormInput) =>
    unwrap(
      api.PUT('/api/catalog/exercises/{exerciseId}', {
        params: { path: { exerciseId } },
        body: toRequestBody(input),
      }),
    ) as Promise<Exercise>,
  deleteExercise: (exerciseId: string) =>
    unwrap(api.DELETE('/api/catalog/exercises/{exerciseId}', { params: { path: { exerciseId } } })),
}
