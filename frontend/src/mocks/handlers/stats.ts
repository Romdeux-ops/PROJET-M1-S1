import { http, HttpResponse } from 'msw'

import type { StatsOverview } from '@/features/stats'

import { db, userFromRequest } from '../db'
import { isoDaysAgo, networkDelay, problem } from '../utils'

function trend(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export const statsHandlers = [
  http.get('*/api/stats/overview', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')

    const dateOf = (s: (typeof db.sessions)[number]) => s.performedAt.slice(0, 10)
    const inRange = (from: number, to: number) =>
      db.sessions.filter((s) => dateOf(s) <= isoDaysAgo(from) && dateOf(s) > isoDaysAgo(to))
    const thisWeek = inRange(0, 7)
    const lastWeek = inRange(7, 14)
    const minutes = (list: typeof thisWeek) => list.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0)

    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = isoDaysAgo(6 - i)
      return {
        date,
        minutes: minutes(db.sessions.filter((s) => dateOf(s) === date)),
      }
    })

    let streak = 0
    while (db.sessions.some((s) => dateOf(s) === isoDaysAgo(streak))) streak++

    const rpes = thisWeek.flatMap((s) => s.sets.map((set) => set.rpe).filter((rpe): rpe is number => rpe != null))

    const overview: StatsOverview = {
      sessionsThisWeek: thisWeek.length,
      sessionsTrend: trend(thisWeek.length, lastWeek.length),
      minutesThisWeek: minutes(thisWeek),
      minutesTrend: trend(minutes(thisWeek), minutes(lastWeek)),
      currentStreakDays: streak,
      averageEffort: rpes.length ? rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length : 0,
      weeklyActivity,
    }
    return HttpResponse.json(overview)
  }),
]
