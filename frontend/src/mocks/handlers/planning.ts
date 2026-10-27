import { http, HttpResponse } from 'msw'

import type { ScheduledSession, ScheduleFormInput } from '@/features/planning/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

export const planningHandlers = [
  http.get('*/api/planning/scheduled', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    let results = db.scheduledSessions.filter((s) => s.athleteId === user.id)
    if (from) results = results.filter((s) => s.scheduledDate >= from)
    if (to) results = results.filter((s) => s.scheduledDate <= to)
    return HttpResponse.json(results)
  }),

  http.get('*/api/planning/scheduled/today', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const today = new Date().toISOString().slice(0, 10)
    return HttpResponse.json(db.scheduledSessions.filter((s) => s.athleteId === user.id && s.scheduledDate === today))
  }),

  http.get('*/api/planning/pending-validations', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    return HttpResponse.json(db.scheduledSessions.filter((s) => s.status === 'PENDING_VALIDATION'))
  }),

  http.post<never, ScheduleFormInput>('*/api/planning/scheduled', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const body = await request.json()
    const session: ScheduledSession = {
      id: crypto.randomUUID(),
      title: body.title,
      scheduledDate: body.scheduledDate,
      status: 'PLANNED',
      programId: null,
      programDayId: null,
      workoutSessionId: null,
      notes: body.notes || null,
      athleteId: user.id,
      athleteName: `${user.firstName} ${user.lastName}`,
    }
    db.scheduledSessions.unshift(session)
    return HttpResponse.json(session, { status: 201 })
  }),

  http.patch<{ id: string }, { scheduledDate: string }>(
    '*/api/planning/scheduled/:id/reschedule',
    async ({ request, params }) => {
      await networkDelay()
      if (!userFromRequest(request)) return problem(401, 'Session invalide.')
      const session = db.scheduledSessions.find((s) => s.id === params.id)
      if (!session) return problem(404, 'Séance planifiée introuvable.')
      const body = await request.json()
      session.scheduledDate = body.scheduledDate
      return HttpResponse.json(session)
    },
  ),

  http.patch<{ id: string }>('*/api/planning/scheduled/:id/skip', async ({ request, params }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const session = db.scheduledSessions.find((s) => s.id === params.id)
    if (!session) return problem(404, 'Séance planifiée introuvable.')
    session.status = 'SKIPPED'
    return HttpResponse.json(session)
  }),

  http.patch<{ id: string }, { workoutSessionId: string }>(
    '*/api/planning/scheduled/:id/complete',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const session = db.scheduledSessions.find((s) => s.id === params.id)
      if (!session) return problem(404, 'Séance planifiée introuvable.')
      if (session.status !== 'PLANNED') return problem(409, 'Cette séance ne peut plus être terminée.')
      const body = await request.json()
      const workoutSession = db.sessions.find((s) => s.id === body.workoutSessionId)
      if (!workoutSession) return problem(404, 'Séance réalisée introuvable.')
      session.workoutSessionId = body.workoutSessionId
      const hasCoach = db.coachAthletes.some((c) => c.athleteId === user.id && c.status === 'ACTIVE')
      session.status = hasCoach ? 'PENDING_VALIDATION' : 'DONE'
      return HttpResponse.json(session)
    },
  ),

  http.patch<{ id: string }>('*/api/planning/scheduled/:id/validate', async ({ request, params }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const session = db.scheduledSessions.find((s) => s.id === params.id)
    if (!session) return problem(404, 'Séance planifiée introuvable.')
    if (session.status !== 'PENDING_VALIDATION') return problem(409, 'Cette séance n’est pas en attente de validation.')
    session.status = 'DONE'
    return HttpResponse.json(session)
  }),

  http.delete<{ id: string }>('*/api/planning/scheduled/:id', async ({ request, params }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const index = db.scheduledSessions.findIndex((s) => s.id === params.id)
    if (index === -1) return problem(404, 'Séance planifiée introuvable.')
    db.scheduledSessions.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
