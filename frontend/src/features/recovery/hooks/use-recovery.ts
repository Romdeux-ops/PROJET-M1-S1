import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/lib/auth/session'

import * as recoveryApi from '../api/recovery-api'
import type { RecoveryDateRange } from '../api/recovery-types'

export const recoveryKeys = {
  all: ['recovery'] as const,

  user: (userId: string | null) => ['recovery', userId] as const,

  overview: (userId: string | null) => [...recoveryKeys.user(userId), 'overview'] as const,

  assessments: (userId: string | null, range: RecoveryDateRange) =>
    [...recoveryKeys.user(userId), 'assessments', range] as const,

  assessment: (userId: string | null, date: string) =>
    [...recoveryKeys.user(userId), 'assessment', date] as const,

  todayAssessment: (userId: string | null) =>
    [...recoveryKeys.user(userId), 'assessment', 'today'] as const,

  settings: (userId: string | null) => [...recoveryKeys.user(userId), 'settings'] as const,

  sleepLogs: (userId: string | null, range: RecoveryDateRange) =>
    [...recoveryKeys.user(userId), 'sleep', range] as const,

  sleepLog: (userId: string | null, sleepLogId: string) =>
    [...recoveryKeys.user(userId), 'sleep-log', sleepLogId] as const,

  checkins: (userId: string | null, range: RecoveryDateRange) =>
    [...recoveryKeys.user(userId), 'checkins', range] as const,

  checkin: (userId: string | null, date: string) =>
    [...recoveryKeys.user(userId), 'checkin', date] as const,

  workouts: (userId: string | null, range: RecoveryDateRange) =>
    [...recoveryKeys.user(userId), 'workouts', range] as const,

  workout: (userId: string | null, workoutSessionId: string) =>
    [...recoveryKeys.user(userId), 'workout', workoutSessionId] as const,

  workoutDetails: (userId: string | null, workoutSessionId: string) =>
    [...recoveryKeys.user(userId), 'workout-details', workoutSessionId] as const,

  dailySummaries: (userId: string | null, range: RecoveryDateRange) =>
    [...recoveryKeys.user(userId), 'daily-summaries', range] as const,

  dailySummary: (userId: string | null, date: string) =>
    [...recoveryKeys.user(userId), 'daily-summary', date] as const,

  weightHistory: (userId: string | null, range: RecoveryDateRange) =>
    [...recoveryKeys.user(userId), 'weight-history', range] as const,
}

export function useRecoveryUserId() {
  return useSession((state) => state.user?.id ?? null)
}

function isValidRange(range: RecoveryDateRange) {
  return Boolean(range.from && range.to && range.from <= range.to)
}

export function useRecoveryOverview() {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.overview(userId),
    queryFn: recoveryApi.getRecoveryOverview,
    enabled: Boolean(userId),
  })
}

export function useRecoveryAssessments(range: RecoveryDateRange) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.assessments(userId, range),
    queryFn: () => recoveryApi.getRecoveryAssessments(range),
    enabled: Boolean(userId) && isValidRange(range),
  })
}

export function useRecoveryAssessment(date: string) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.assessment(userId, date),
    queryFn: () => recoveryApi.getRecoveryAssessment(date),
    enabled: Boolean(userId && date),
  })
}

export function useTodayRecoveryAssessment() {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.todayAssessment(userId),
    queryFn: recoveryApi.getTodayRecoveryAssessment,
    enabled: Boolean(userId),
  })
}

export function useRecoverySettings() {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.settings(userId),
    queryFn: recoveryApi.getRecoverySettings,
    enabled: Boolean(userId),
  })
}

export function useSleepLogs(range: RecoveryDateRange) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.sleepLogs(userId, range),
    queryFn: () => recoveryApi.getSleepLogs(range),
    enabled: Boolean(userId) && isValidRange(range),
  })
}

export function useSleepLog(sleepLogId: string) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.sleepLog(userId, sleepLogId),
    queryFn: () => recoveryApi.getSleepLog(sleepLogId),
    enabled: Boolean(userId && sleepLogId),
  })
}

export function useRecoveryCheckins(range: RecoveryDateRange) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.checkins(userId, range),
    queryFn: () => recoveryApi.getRecoveryCheckins(range),
    enabled: Boolean(userId) && isValidRange(range),
  })
}

export function useRecoveryCheckin(date: string) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.checkin(userId, date),
    queryFn: () => recoveryApi.getRecoveryCheckin(date),
    enabled: Boolean(userId && date),
  })
}

export function useRecoveryWorkouts(range: RecoveryDateRange) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.workouts(userId, range),
    queryFn: () => recoveryApi.getRecoveryWorkouts(range),
    enabled: Boolean(userId) && isValidRange(range),
  })
}

export function useRecoveryWorkout(workoutSessionId: string) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.workout(userId, workoutSessionId),
    queryFn: () => recoveryApi.getRecoveryWorkout(workoutSessionId),
    enabled: Boolean(userId && workoutSessionId),
  })
}

export function useRecoveryWorkoutDetails(workoutSessionId: string) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.workoutDetails(userId, workoutSessionId),
    queryFn: () => recoveryApi.getRecoveryWorkoutDetails(workoutSessionId),
    enabled: Boolean(userId && workoutSessionId),
  })
}

export function useRecoveryDailySummaries(range: RecoveryDateRange) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.dailySummaries(userId, range),
    queryFn: () => recoveryApi.getRecoveryDailySummaries(range),
    enabled: Boolean(userId) && isValidRange(range),
  })
}

export function useRecoveryDailySummary(date: string) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.dailySummary(userId, date),
    queryFn: () => recoveryApi.getRecoveryDailySummary(date),
    enabled: Boolean(userId && date),
  })
}

export function useBodyWeightHistory(range: RecoveryDateRange) {
  const userId = useRecoveryUserId()

  return useQuery({
    queryKey: recoveryKeys.weightHistory(userId, range),
    queryFn: () => recoveryApi.getBodyWeightHistory(range),
    enabled: Boolean(userId) && isValidRange(range),
  })
}
