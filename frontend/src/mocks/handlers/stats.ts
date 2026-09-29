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

    const inRange = (from: number, to: number) =>
      db.sessions.filter((s) => s.date <= isoDaysAgo(from) && s.date > isoDaysAgo(to))
    const thisWeek = inRange(0, 7)
    const lastWeek = inRange(7, 14)
    const minutes = (list: typeof thisWeek) => list.reduce((sum, s) => sum + s.durationMinutes, 0)

    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = isoDaysAgo(6 - i)
      return {
        date,
        minutes: minutes(db.sessions.filter((s) => s.date === date)),
      }
    })

    let streak = 0
    while (db.sessions.some((s) => s.date === isoDaysAgo(streak))) streak++

    const overview: StatsOverview = {
      sessionsThisWeek: thisWeek.length,
      sessionsTrend: trend(thisWeek.length, lastWeek.length),
      minutesThisWeek: minutes(thisWeek),
      minutesTrend: trend(minutes(thisWeek), minutes(lastWeek)),
      currentStreakDays: streak,
      averageEffort: thisWeek.length
        ? thisWeek.reduce((sum, s) => sum + s.perceivedEffort, 0) / thisWeek.length
        : 0,
      weeklyActivity,
    }
    return HttpResponse.json(overview)
  }),
]
