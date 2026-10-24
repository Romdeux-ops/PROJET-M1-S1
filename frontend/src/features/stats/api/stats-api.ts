import { http } from '@/lib/api/client'

/**
 * Contrat du module stats (backend) :
 *   GET /api/stats/overview                            -> StatsOverview (semaine en cours vs semaine precedente)
 *   GET /api/stats/exercises/{exerciseId}/progression   -> ExerciseProgressionPoint[]
 *   GET /api/stats/volume/weekly?weeks=12               -> WeeklyVolumePoint[]
 *   GET /api/stats/streak                               -> { currentStreakDays: number }
 *   GET /api/stats/adherence/weekly?weeks=8             -> WeeklyAdherencePoint[]
 *   GET /api/stats/muscle-distribution?days=30          -> MuscleVolumeShare[]
 *   GET /api/stats/progression-score                    -> ProgressionScore
 */
export interface StatsOverview {
  sessionsThisWeek: number
  /** Variation en % du nombre de seances par rapport a la semaine precedente. */
  sessionsTrend: number
  minutesThisWeek: number
  minutesTrend: number
  currentStreakDays: number
  averageEffort: number
  /** 7 derniers jours, du plus ancien au plus recent. */
  weeklyActivity: { date: string; minutes: number }[]
}

export interface ExerciseProgressionPoint {
  date: string
  maxWeight: number
  estimated1Rm: number
}

export interface WeeklyVolumePoint {
  weekStart: string
  totalVolume: number
}

export interface WeeklyAdherencePoint {
  weekStart: string
  planned: number
  done: number
  skipped: number
}

export interface MuscleVolumeShare {
  muscleGroupId: string
  muscleGroupCode: string
  muscleGroupName: string
  volume: number
}

export interface ProgressionScore {
  last30DaysVolume: number
  previous30DaysVolume: number
  changePercent: number
}

export const statsApi = {
  overview: () => http.get<StatsOverview>('/api/stats/overview'),
  exerciseProgression: (exerciseId: string) =>
    http.get<ExerciseProgressionPoint[]>(`/api/stats/exercises/${exerciseId}/progression`),
  weeklyVolume: (weeks = 12) => http.get<WeeklyVolumePoint[]>(`/api/stats/volume/weekly?weeks=${weeks}`),
  weeklyAdherence: (weeks = 8) => http.get<WeeklyAdherencePoint[]>(`/api/stats/adherence/weekly?weeks=${weeks}`),
  muscleDistribution: (days = 30) =>
    http.get<MuscleVolumeShare[]>(`/api/stats/muscle-distribution?days=${days}`),
  progressionScore: () => http.get<ProgressionScore>('/api/stats/progression-score'),
}
