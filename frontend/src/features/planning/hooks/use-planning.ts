import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { planningApi } from '../api/planning-api'
import type { ScheduleFormInput } from '../schemas'

export const planningKeys = {
  all: ['planning'] as const,
  range: (from: string, to: string) => [...planningKeys.all, 'range', from, to] as const,
  today: () => [...planningKeys.all, 'today'] as const,
  pendingValidations: () => [...planningKeys.all, 'pending-validations'] as const,
}

export const scheduledRangeQuery = (from: string, to: string) =>
  queryOptions({ queryKey: planningKeys.range(from, to), queryFn: () => planningApi.listBetween(from, to) })

export function useScheduledRange(from: string, to: string) {
  return useQuery(scheduledRangeQuery(from, to))
}

export function useScheduledToday() {
  return useQuery({ queryKey: planningKeys.today(), queryFn: planningApi.listToday })
}

export function usePendingValidations() {
  return useQuery({ queryKey: planningKeys.pendingValidations(), queryFn: planningApi.listPendingValidations })
}

export function useSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ScheduleFormInput) => planningApi.schedule(input),
    meta: { successMessage: 'Séance planifiée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planningKeys.all }),
  })
}

export function useReschedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, scheduledDate }: { id: string; scheduledDate: string }) =>
      planningApi.reschedule(id, scheduledDate),
    meta: { successMessage: 'Séance replanifiée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planningKeys.all }),
  })
}

export function useSkip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => planningApi.skip(id),
    meta: { successMessage: 'Séance marquée sautée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planningKeys.all }),
  })
}

export function useComplete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, workoutSessionId }: { id: string; workoutSessionId: string }) =>
      planningApi.complete(id, workoutSessionId),
    meta: { successMessage: 'Séance marquée terminée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planningKeys.all }),
  })
}

export function useValidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => planningApi.validate(id),
    meta: { successMessage: 'Séance validée' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planningKeys.all }),
  })
}

export function useDeleteScheduled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => planningApi.delete(id),
    meta: { successMessage: 'Séance retirée du planning' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planningKeys.all }),
  })
}
