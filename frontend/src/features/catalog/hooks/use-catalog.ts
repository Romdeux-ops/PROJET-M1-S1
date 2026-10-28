import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { catalogApi } from '../api/catalog-api'
import type { ExerciseFormInput, ExerciseSearchFilters } from '../schemas'

export const catalogKeys = {
  all: ['catalog'] as const,
  muscleGroups: () => [...catalogKeys.all, 'muscle-groups'] as const,
  tags: () => [...catalogKeys.all, 'tags'] as const,
  exercises: (filters: ExerciseSearchFilters) =>
    [...catalogKeys.all, 'exercises', filters] as const,
  exercise: (id: string) => [...catalogKeys.all, 'exercise', id] as const,
}

export function useMuscleGroups() {
  return useQuery({ queryKey: catalogKeys.muscleGroups(), queryFn: catalogApi.listMuscleGroups })
}

export function useTags() {
  return useQuery({ queryKey: catalogKeys.tags(), queryFn: catalogApi.listTags })
}

export const exercisesQuery = (filters: ExerciseSearchFilters) =>
  queryOptions({
    queryKey: catalogKeys.exercises(filters),
    queryFn: () => catalogApi.searchExercises(filters),
  })

export function useExercises(filters: ExerciseSearchFilters) {
  return useQuery(exercisesQuery(filters))
}

export function useCreateExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ExerciseFormInput) => catalogApi.createExercise(input),
    meta: { successMessage: 'Exercice créé' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
  })
}

export function useUpdateExercise(exerciseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ExerciseFormInput) => catalogApi.updateExercise(exerciseId, input),
    meta: { successMessage: 'Exercice mis à jour' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
  })
}

export function useDeleteExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exerciseId: string) => catalogApi.deleteExercise(exerciseId),
    meta: { successMessage: 'Exercice supprimé' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
  })
}
