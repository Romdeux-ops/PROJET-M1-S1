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
    const minutes = (list: typeof thisWeek) =>
      list.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0)

    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = isoDaysAgo(6 - i)
      return {
        date,
        minutes: minutes(db.sessions.filter((s) => dateOf(s) === date)),
      }
    })

    let streak = 0
    while (db.sessions.some((s) => dateOf(s) === isoDaysAgo(streak))) streak++

    const rpes = thisWeek.flatMap((s) =>
      s.sets.map((set) => set.rpe).filter((rpe): rpe is number => rpe != null),
    )

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

  http.get<{ exerciseId: string }>(
    '*/api/stats/exercises/:exerciseId/progression',
    async ({ request }) => {
      await networkDelay()
      if (!userFromRequest(request)) return problem(401, 'Session invalide.')
      return HttpResponse.json([])
    },
  ),

  http.get('*/api/stats/volume/weekly', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const weeklyVolume = Array.from({ length: 4 }, (_, i) => ({
      weekStart: isoDaysAgo((3 - i) * 7),
      totalVolume: 0,
    }))
    return HttpResponse.json(weeklyVolume)
  }),

  http.get('*/api/stats/streak', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const dateOf = (s: (typeof db.sessions)[number]) => s.performedAt.slice(0, 10)
    let streak = 0
    while (db.sessions.some((s) => dateOf(s) === isoDaysAgo(streak))) streak++
    return HttpResponse.json({ currentStreakDays: streak })
  }),

  http.get('*/api/stats/adherence/weekly', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const weeklyAdherence = Array.from({ length: 4 }, (_, i) => ({
      weekStart: isoDaysAgo((3 - i) * 7),
      planned: 0,
      done: 0,
      skipped: 0,
      pending: 0,
    }))
    return HttpResponse.json(weeklyAdherence)
  }),

  http.get('*/api/stats/muscle-distribution', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return HttpResponse.json(
      db.muscleGroups.map((g) => ({
        muscleGroupId: g.id,
        muscleGroupCode: g.code,
        muscleGroupName: g.name,
        volume: 0,
      })),
    )
  }),

  http.get('*/api/stats/progression-score', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return HttpResponse.json({ last30DaysVolume: 0, previous30DaysVolume: 0, changePercent: 0 })
  }),
]
