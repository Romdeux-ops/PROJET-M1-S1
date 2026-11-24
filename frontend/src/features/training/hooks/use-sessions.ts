import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { trainingApi } from '../api/training-api'
import { celebrateProgress, snapshotRecords } from '../celebrate'
import type { AddSetInput } from '../schemas'

/** Cles de cache centralisees : toute invalidation passe par ici. */
export const trainingKeys = {
  all: ['training'] as const,
  sessions: () => [...trainingKeys.all, 'sessions'] as const,
  session: (id: string) => [...trainingKeys.all, 'session', id] as const,
  personalRecords: () => [...trainingKeys.all, 'personal-records'] as const,
}

export const sessionsQuery = () =>
  queryOptions({ queryKey: trainingKeys.sessions(), queryFn: trainingApi.list })

export function useSessions() {
  return useQuery(sessionsQuery())
}

export const sessionQuery = (sessionId: string) =>
  queryOptions({
    queryKey: trainingKeys.session(sessionId),
    queryFn: () => trainingApi.get(sessionId),
    enabled: Boolean(sessionId),
  })

export function useSessionDetail(sessionId: string) {
  return useQuery(sessionQuery(sessionId))
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: trainingKeys.personalRecords(),
    queryFn: trainingApi.personalRecords,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: trainingApi.create,
    meta: { successMessage: 'Séance enregistrée' },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trainingKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ])
      void celebrateProgress(queryClient)
    },
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

function useSessionMutator(sessionId: string) {
  const queryClient = useQueryClient()
  return (session: Awaited<ReturnType<typeof trainingApi.get>>) => {
    queryClient.setQueryData(trainingKeys.session(sessionId), session)
    queryClient.invalidateQueries({ queryKey: trainingKeys.sessions() })
    queryClient.invalidateQueries({ queryKey: trainingKeys.personalRecords() })
  }
}

export function useAddSet(sessionId: string) {
  const queryClient = useQueryClient()
  const onSuccess = useSessionMutator(sessionId)
  return useMutation({
    mutationFn: (input: AddSetInput) => trainingApi.addSet(sessionId, input),
    meta: { successMessage: 'Série ajoutée' },
    onMutate: () => snapshotRecords(queryClient),
    onSuccess: (session, _input, recordsBefore) => {
      onSuccess(session)
      void celebrateProgress(queryClient, recordsBefore)
    },
  })
}

export function useDeleteSet(sessionId: string) {
  const onSuccess = useSessionMutator(sessionId)
  return useMutation({
    mutationFn: (setId: string) => trainingApi.removeSet(sessionId, setId),
    meta: { successMessage: 'Série supprimée' },
    onSuccess,
  })
}
