import { queryOptions, useQuery } from '@tanstack/react-query'

import { statsApi } from '../api/stats-api'

export const statsKeys = {
  all: ['stats'] as const,
  overview: () => [...statsKeys.all, 'overview'] as const,
  exerciseProgression: (exerciseId: string) => [...statsKeys.all, 'exercise-progression', exerciseId] as const,
  weeklyVolume: (weeks: number) => [...statsKeys.all, 'weekly-volume', weeks] as const,
  weeklyAdherence: (weeks: number) => [...statsKeys.all, 'weekly-adherence', weeks] as const,
  muscleDistribution: (days: number) => [...statsKeys.all, 'muscle-distribution', days] as const,
  progressionScore: () => [...statsKeys.all, 'progression-score'] as const,
}

export const statsOverviewQuery = () =>
  queryOptions({ queryKey: statsKeys.overview(), queryFn: statsApi.overview })

export function useStatsOverview() {
  return useQuery(statsOverviewQuery())
}

export function useExerciseProgression(exerciseId: string) {
  return useQuery({
    queryKey: statsKeys.exerciseProgression(exerciseId),
    queryFn: () => statsApi.exerciseProgression(exerciseId),
    enabled: Boolean(exerciseId),
  })
}

export function useWeeklyVolume(weeks = 12) {
  return useQuery({ queryKey: statsKeys.weeklyVolume(weeks), queryFn: () => statsApi.weeklyVolume(weeks) })
}

export function useWeeklyAdherence(weeks = 8) {
  return useQuery({ queryKey: statsKeys.weeklyAdherence(weeks), queryFn: () => statsApi.weeklyAdherence(weeks) })
}

export function useMuscleDistribution(days = 30) {
  return useQuery({ queryKey: statsKeys.muscleDistribution(days), queryFn: () => statsApi.muscleDistribution(days) })
}

export function useProgressionScore() {
  return useQuery({ queryKey: statsKeys.progressionScore(), queryFn: statsApi.progressionScore })
}
