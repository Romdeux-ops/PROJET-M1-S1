import { http, HttpResponse } from 'msw'

import type { TrainingSession } from '@/features/training'
import type { AddSetInput, CreateSessionInput } from '@/features/training/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

export const trainingHandlers = [
  http.get('*/api/training/sessions', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const sessions = [...db.sessions].sort((a, b) => b.performedAt.localeCompare(a.performedAt))
    return HttpResponse.json(sessions)
  }),

  http.get<{ id: string }>('*/api/training/sessions/:id', async ({ request, params }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const session = db.sessions.find((s) => s.id === params.id)
    if (!session) return problem(404, 'Séance introuvable.')
    return HttpResponse.json(session)
  }),

  http.post<never, CreateSessionInput>('*/api/training/sessions', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const body = await request.json()
    const session: TrainingSession = {
      id: crypto.randomUUID(),
      title: body.title,
      performedAt: body.performedAt,
      durationMinutes: body.durationMinutes ?? null,
      notes: body.notes || null,
      sets: [],
      totalVolume: 0,
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

  http.post<{ id: string }, AddSetInput>('*/api/training/sessions/:id/sets', async ({ request, params }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const session = db.sessions.find((s) => s.id === params.id)
    if (!session) return problem(404, 'Séance introuvable.')
    const body = await request.json()
    session.sets.push({
      id: crypto.randomUUID(),
      exerciseId: body.exerciseId,
      exerciseName: 'Exercice',
      position: session.sets.length,
      setNumber: body.setNumber,
      reps: body.reps,
      weightKg: body.weightKg,
      rpe: body.rpe ?? null,
      restSeconds: body.restSeconds ?? null,
      volume: body.weightKg * body.reps,
      isPersonalRecord: false,
    })
    session.totalVolume = session.sets.reduce((sum, s) => sum + s.volume, 0)
    return HttpResponse.json(session)
  }),

  http.delete<{ id: string; setId: string }>(
    '*/api/training/sessions/:id/sets/:setId',
    async ({ request, params }) => {
      await networkDelay()
      if (!userFromRequest(request)) return problem(401, 'Session invalide.')
      const session = db.sessions.find((s) => s.id === params.id)
      if (!session) return problem(404, 'Séance introuvable.')
      session.sets = session.sets.filter((s) => s.id !== params.setId)
      session.totalVolume = session.sets.reduce((sum, s) => sum + s.volume, 0)
      return HttpResponse.json(session)
    },
  ),

  http.get('*/api/training/personal-records', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return HttpResponse.json([])
  }),
]
