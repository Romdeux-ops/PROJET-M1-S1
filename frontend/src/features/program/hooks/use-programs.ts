import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { programApi } from '../api/program-api'
import type { DayFormInput, ExerciseEntryFormInput, ProgramFormInput, ProgramSearchFilters } from '../schemas'

export const programKeys = {
  all: ['programs'] as const,
  list: (filters: ProgramSearchFilters) => [...programKeys.all, 'list', filters] as const,
  detail: (id: string) => [...programKeys.all, 'detail', id] as const,
  shared: (token: string) => [...programKeys.all, 'shared', token] as const,
}

export const programsQuery = (filters: ProgramSearchFilters) =>
  queryOptions({ queryKey: programKeys.list(filters), queryFn: () => programApi.search(filters) })

export function usePrograms(filters: ProgramSearchFilters) {
  return useQuery(programsQuery(filters))
}

export const programQuery = (programId: string) =>
  queryOptions({
    queryKey: programKeys.detail(programId),
    queryFn: () => programApi.get(programId),
    enabled: Boolean(programId),
  })

export function useProgram(programId: string) {
  return useQuery(programQuery(programId))
}

export function useSharedProgram(shareToken: string) {
  return useQuery({
    queryKey: programKeys.shared(shareToken),
    queryFn: () => programApi.getShared(shareToken),
    enabled: Boolean(shareToken),
  })
}

export function useCreateProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProgramFormInput) => programApi.create(input),
    meta: { successMessage: 'Programme créé' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: programKeys.all }),
  })
}

export function useUpdateProgram(programId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProgramFormInput) => programApi.update(programId, input),
    meta: { successMessage: 'Programme mis à jour' },
    onSuccess: (program) => {
      queryClient.setQueryData(programKeys.detail(programId), program)
      queryClient.invalidateQueries({ queryKey: programKeys.all })
    },
  })
}

export function useDeleteProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (programId: string) => programApi.delete(programId),
    meta: { successMessage: 'Programme supprimé' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: programKeys.all }),
  })
}

export function useDuplicateProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (programId: string) => programApi.duplicate(programId),
    meta: { successMessage: 'Programme dupliqué dans vos programmes' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: programKeys.all }),
  })
}

function useProgramMutator(programId: string) {
  const queryClient = useQueryClient()
  return (program: Awaited<ReturnType<typeof programApi.get>>) => {
    queryClient.setQueryData(programKeys.detail(programId), program)
    queryClient.invalidateQueries({ queryKey: programKeys.all })
  }
}

export function useAddDay(programId: string) {
  const onSuccess = useProgramMutator(programId)
  return useMutation({
    mutationFn: (input: DayFormInput) => programApi.addDay(programId, input),
    meta: { successMessage: 'Jour ajouté' },
    onSuccess,
  })
}

export function useDeleteDay(programId: string) {
  const onSuccess = useProgramMutator(programId)
  return useMutation({
    mutationFn: (dayId: string) => programApi.deleteDay(programId, dayId),
    meta: { successMessage: 'Jour supprimé' },
    onSuccess,
  })
}

export function useAddExercise(programId: string) {
  const onSuccess = useProgramMutator(programId)
  return useMutation({
    mutationFn: ({ dayId, input }: { dayId: string; input: ExerciseEntryFormInput }) =>
      programApi.addExercise(programId, dayId, input),
    meta: { successMessage: 'Exercice ajouté au programme' },
    onSuccess,
  })
}

export function useDeleteExerciseEntry(programId: string) {
  const onSuccess = useProgramMutator(programId)
  return useMutation({
    mutationFn: ({ dayId, exerciseEntryId }: { dayId: string; exerciseEntryId: string }) =>
      programApi.deleteExercise(programId, dayId, exerciseEntryId),
    meta: { successMessage: 'Exercice retiré du programme' },
    onSuccess,
  })
}

export function useRateProgram(programId: string) {
  const onSuccess = useProgramMutator(programId)
  return useMutation({
    mutationFn: ({ stars, comment }: { stars: number; comment?: string }) =>
      programApi.rate(programId, stars, comment),
    meta: { successMessage: 'Merci pour votre note' },
    onSuccess,
  })
}
