import { api, unwrap } from '@/lib/api/client'

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

/**
 * Le schema OpenAPI genere par springdoc marque tous les champs comme
 * optionnels : on recast la reponse vers le contrat strict ci-dessus.
 */
export const statsApi = {
  overview: () => unwrap(api.GET('/api/stats/overview')) as Promise<StatsOverview>,
  exerciseProgression: (exerciseId: string) =>
    unwrap(
      api.GET('/api/stats/exercises/{exerciseId}/progression', {
        params: { path: { exerciseId } },
      }),
    ) as Promise<ExerciseProgressionPoint[]>,
  weeklyVolume: (weeks = 12) =>
    unwrap(api.GET('/api/stats/volume/weekly', { params: { query: { weeks } } })) as Promise<
      WeeklyVolumePoint[]
    >,
  weeklyAdherence: (weeks = 8) =>
    unwrap(api.GET('/api/stats/adherence/weekly', { params: { query: { weeks } } })) as Promise<
      WeeklyAdherencePoint[]
    >,
  muscleDistribution: (days = 30) =>
    unwrap(api.GET('/api/stats/muscle-distribution', { params: { query: { days } } })) as Promise<
      MuscleVolumeShare[]
    >,
  progressionScore: () =>
    unwrap(api.GET('/api/stats/progression-score')) as Promise<ProgressionScore>,
}
