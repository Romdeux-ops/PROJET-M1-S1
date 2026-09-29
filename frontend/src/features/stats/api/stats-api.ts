import { http } from '@/lib/api/client'

/**
 * Contrat attendu du module stats (backend) :
 *   GET /api/stats/overview -> StatsOverview (semaine en cours vs semaine precedente)
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

export const statsApi = {
  overview: () => http.get<StatsOverview>('/api/stats/overview'),
}
