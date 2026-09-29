import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { trainingApi } from '../api/training-api'
import type { SessionFilters } from '../schemas'

/** Cles de cache centralisees : toute invalidation passe par ici. */
export const trainingKeys = {
  all: ['training'] as const,
  sessions: (filters: SessionFilters = {}) => [...trainingKeys.all, 'sessions', filters] as const,
}

export const sessionsQuery = (filters: SessionFilters = {}) =>
  queryOptions({
    queryKey: trainingKeys.sessions(filters),
    queryFn: () => trainingApi.list(filters),
  })

export function useSessions(filters: SessionFilters = {}) {
  return useQuery(sessionsQuery(filters))
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: trainingApi.create,
    meta: { successMessage: 'Séance enregistrée' },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: trainingKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ]),
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: trainingApi.remove,
    meta: { successMessage: 'Séance supprimée' },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: trainingKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ]),
  })
}
