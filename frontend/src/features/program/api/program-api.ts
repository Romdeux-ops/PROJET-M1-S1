import { api, unwrap } from '@/lib/api/client'

import type {
  CoachProgramFilters,
  DayFormInput,
  ExerciseEntryFormInput,
  Program,
  ProgramFormInput,
  ProgramSearchFilters,
} from '../schemas'

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
 *   GET    /api/programs                                  -> PageResponse<Program> (filtres en query string ; .content extrait cote client, size=100)
 *   GET    /api/programs/from-my-coaches                   -> PageResponse<Program> (programmes CLIENTS des coachs actifs ; .content extrait cote client)
 *   GET    /api/programs/{id}                              -> Program (404 si PRIVATE d'autrui, ou CLIENTS sans relation active)
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
/**
 * Le schema OpenAPI genere par springdoc marque tous les champs comme
 * optionnels : on recast la reponse vers le contrat strict de `schemas.ts`.
 */
export const programApi = {
  search: async (filters: ProgramSearchFilters) => {
    const page = await unwrap(
      api.GET('/api/programs', {
        params: {
          query: {
            mineOnly: filters.mineOnly,
            category: filters.category,
            level: filters.level,
            size: 100,
          },
        },
      }),
    )
    return (page.content ?? []) as Program[]
  },
  /** Programmes "Mes athlètes" des coachs avec qui l'utilisateur a une relation active. */
  fromMyCoaches: async (filters: CoachProgramFilters) => {
    const page = await unwrap(
      api.GET('/api/programs/from-my-coaches', {
        params: { query: { category: filters.category, level: filters.level, size: 100 } },
      }),
    )
    return (page.content ?? []) as Program[]
  },
  get: (programId: string) =>
    unwrap(
      api.GET('/api/programs/{programId}', { params: { path: { programId } } }),
    ) as Promise<Program>,
  getShared: (shareToken: string) =>
    unwrap(
      api.GET('/api/programs/shared/{shareToken}', { params: { path: { shareToken } } }),
    ) as Promise<Program>,
  create: (input: ProgramFormInput) =>
    unwrap(api.POST('/api/programs', { body: toProgramBody(input) })) as Promise<Program>,
  update: (programId: string, input: ProgramFormInput) =>
    unwrap(
      api.PUT('/api/programs/{programId}', {
        params: { path: { programId } },
        body: toProgramBody(input),
      }),
    ) as Promise<Program>,
  delete: (programId: string) =>
    unwrap(api.DELETE('/api/programs/{programId}', { params: { path: { programId } } })),
  duplicate: (programId: string) =>
    unwrap(
      api.POST('/api/programs/{programId}/duplicate', { params: { path: { programId } } }),
    ) as Promise<Program>,
  addDay: (programId: string, input: DayFormInput) =>
    unwrap(
      api.POST('/api/programs/{programId}/days', { params: { path: { programId } }, body: input }),
    ) as Promise<Program>,
  deleteDay: (programId: string, dayId: string) =>
    unwrap(
      api.DELETE('/api/programs/{programId}/days/{dayId}', {
        params: { path: { programId, dayId } },
      }),
    ) as Promise<Program>,
  /** `orderedIds` : tous les jours du programme, chacun une fois, dans le nouvel ordre. */
  reorderDays: (programId: string, orderedIds: string[]) =>
    unwrap(
      api.PATCH('/api/programs/{programId}/days/positions', {
        params: { path: { programId } },
        body: { orderedIds },
      }),
    ) as Promise<Program>,
  addExercise: (programId: string, dayId: string, input: ExerciseEntryFormInput) =>
    unwrap(
      api.POST('/api/programs/{programId}/days/{dayId}/exercises', {
        params: { path: { programId, dayId } },
        body: {
          exerciseId: input.exerciseId,
          sets: input.sets,
          reps: input.reps,
          restSeconds: input.restSeconds,
          notes: input.notes || undefined,
        },
      }),
    ) as Promise<Program>,
  deleteExercise: (programId: string, dayId: string, exerciseEntryId: string) =>
    unwrap(
      api.DELETE('/api/programs/{programId}/days/{dayId}/exercises/{exerciseEntryId}', {
        params: { path: { programId, dayId, exerciseEntryId } },
      }),
    ) as Promise<Program>,
  rate: (programId: string, stars: number, comment?: string) =>
    unwrap(
      api.POST('/api/programs/{programId}/ratings', {
        params: { path: { programId } },
        body: { stars, comment },
      }),
    ) as Promise<Program>,
}
