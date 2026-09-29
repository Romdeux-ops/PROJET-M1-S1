import { http, HttpResponse } from 'msw'

import type { TrainingSession } from '@/features/training'
import type { CreateSessionInput } from '@/features/training/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

export const trainingHandlers = [
  http.get('*/api/training/sessions', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const type = new URL(request.url).searchParams.get('type')
    const sessions = db.sessions
      .filter((s) => !type || s.type === type)
      .sort((a, b) => b.date.localeCompare(a.date))
    return HttpResponse.json(sessions)
  }),

  http.post<never, CreateSessionInput>('*/api/training/sessions', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const body = await request.json()
    const session: TrainingSession = {
      id: crypto.randomUUID(),
      exerciseCount: 0,
      ...body,
      notes: body.notes || null,
    }
    db.sessions.unshift(session)
    return HttpResponse.json(session, { status: 201 })
  }),

  http.delete<{ id: string }>('*/api/training/sessions/:id', async ({ request, params }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const index = db.sessions.findIndex((s) => s.id === params.id)
    if (index === -1) return problem(404, 'Séance introuvable.')
    db.sessions.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
