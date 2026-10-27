import { http, HttpResponse } from 'msw'

import type { DayFormInput, ExerciseEntryFormInput, Program, ProgramFormInput } from '@/features/program/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

interface PositionUpdate {
  id: string
  position: number
}

export const programHandlers = [
  http.get('*/api/programs', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const url = new URL(request.url)
    const mineOnly = url.searchParams.get('mineOnly') === 'true'
    const category = url.searchParams.get('category')
    const level = url.searchParams.get('level')
    let results = db.programs.filter((p) => p.visibility === 'PUBLIC' || p.ownerId === user.id)
    if (mineOnly) results = results.filter((p) => p.ownerId === user.id)
    if (category) results = results.filter((p) => p.category === category)
    if (level) results = results.filter((p) => p.level === level)
    const content = results.map((p) => ({ ...p, mine: p.ownerId === user.id }))
    return HttpResponse.json({ content, page: 0, size: content.length, totalElements: content.length, totalPages: 1 })
  }),

  http.get<{ id: string }>('*/api/programs/:id', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const program = db.programs.find((p) => p.id === params.id)
    if (!program || (program.visibility !== 'PUBLIC' && program.ownerId !== user.id))
      return problem(404, 'Programme introuvable.')
    return HttpResponse.json({ ...program, mine: program.ownerId === user.id })
  }),

  http.get<{ token: string }>('*/api/programs/shared/:token', async ({ request, params }) => {
    await networkDelay()
    const program = db.programs.find((p) => p.shareToken === params.token)
    if (!program) return problem(404, 'Programme introuvable.')
    const user = userFromRequest(request)
    return HttpResponse.json({ ...program, mine: user?.id === program.ownerId })
  }),

  http.post<never, ProgramFormInput>('*/api/programs', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const body = await request.json()
    const program: Program = {
      id: crypto.randomUUID(),
      ownerId: user.id,
      ownerName: `${user.firstName} ${user.lastName}`,
      title: body.title,
      description: body.description || null,
      category: body.category,
      level: body.level,
      visibility: body.visibility,
      shareToken: body.visibility === 'PUBLIC' ? crypto.randomUUID() : null,
      averageRating: 0,
      ratingsCount: 0,
      mine: true,
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.programs.unshift(program)
    return HttpResponse.json(program, { status: 201 })
  }),

  http.put<{ id: string }, ProgramFormInput>('*/api/programs/:id', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const program = db.programs.find((p) => p.id === params.id)
    if (!program) return problem(404, 'Programme introuvable.')
    if (program.ownerId !== user.id) return problem(403, 'Réservé au propriétaire.')
    const body = await request.json()
    Object.assign(program, {
      title: body.title,
      description: body.description || null,
      category: body.category,
      level: body.level,
      visibility: body.visibility,
      updatedAt: new Date().toISOString(),
    })
    return HttpResponse.json(program)
  }),

  http.delete<{ id: string }>('*/api/programs/:id', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const program = db.programs.find((p) => p.id === params.id)
    if (!program) return problem(404, 'Programme introuvable.')
    if (program.ownerId !== user.id) return problem(403, 'Réservé au propriétaire.')
    db.programs = db.programs.filter((p) => p.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post<{ id: string }>('*/api/programs/:id/duplicate', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const source = db.programs.find((p) => p.id === params.id)
    if (!source) return problem(404, 'Programme introuvable.')
    const copy: Program = {
      ...source,
      id: crypto.randomUUID(),
      ownerId: user.id,
      ownerName: `${user.firstName} ${user.lastName}`,
      visibility: 'PRIVATE',
      shareToken: null,
      averageRating: 0,
      ratingsCount: 0,
      mine: true,
      days: source.days.map((d) => ({ ...d, id: crypto.randomUUID(), exercises: d.exercises.map((e) => ({ ...e, id: crypto.randomUUID() })) })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.programs.unshift(copy)
    return HttpResponse.json(copy, { status: 201 })
  }),

  http.post<{ id: string }, DayFormInput>('*/api/programs/:id/days', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const program = db.programs.find((p) => p.id === params.id)
    if (!program) return problem(404, 'Programme introuvable.')
    if (program.ownerId !== user.id) return problem(403, 'Réservé au propriétaire.')
    const body = await request.json()
    const maxPosition = program.days.reduce((max, d) => Math.max(max, d.position), -1)
    program.days.push({ id: crypto.randomUUID(), position: maxPosition + 1, name: body.name, restDay: body.restDay, exercises: [] })
    program.updatedAt = new Date().toISOString()
    return HttpResponse.json(program)
  }),

  http.delete<{ id: string; dayId: string }>('*/api/programs/:id/days/:dayId', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const program = db.programs.find((p) => p.id === params.id)
    if (!program) return problem(404, 'Programme introuvable.')
    if (program.ownerId !== user.id) return problem(403, 'Réservé au propriétaire.')
    program.days = program.days.filter((d) => d.id !== params.dayId)
    program.updatedAt = new Date().toISOString()
    return HttpResponse.json(program)
  }),

  http.patch<{ id: string }, PositionUpdate[]>('*/api/programs/:id/days/positions', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const program = db.programs.find((p) => p.id === params.id)
    if (!program) return problem(404, 'Programme introuvable.')
    if (program.ownerId !== user.id) return problem(403, 'Réservé au propriétaire.')
    const updates = await request.json()
    for (const u of updates) {
      const day = program.days.find((d) => d.id === u.id)
      if (day) day.position = u.position
    }
    return HttpResponse.json(program)
  }),

  http.post<{ id: string; dayId: string }, ExerciseEntryFormInput>(
    '*/api/programs/:id/days/:dayId/exercises',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const program = db.programs.find((p) => p.id === params.id)
      if (!program) return problem(404, 'Programme introuvable.')
      if (program.ownerId !== user.id) return problem(403, 'Réservé au propriétaire.')
      const day = program.days.find((d) => d.id === params.dayId)
      if (!day) return problem(404, 'Jour introuvable.')
      const body = await request.json()
      const exercise = db.exercises.find((e) => e.id === body.exerciseId)
      const maxPosition = day.exercises.reduce((max, e) => Math.max(max, e.position), -1)
      day.exercises.push({
        id: crypto.randomUUID(),
        exerciseId: body.exerciseId,
        exerciseName: exercise?.name ?? 'Exercice',
        position: maxPosition + 1,
        sets: body.sets,
        reps: body.reps,
        restSeconds: body.restSeconds,
        notes: body.notes || null,
      })
      program.updatedAt = new Date().toISOString()
      return HttpResponse.json(program)
    },
  ),

  http.delete<{ id: string; dayId: string; eid: string }>(
    '*/api/programs/:id/days/:dayId/exercises/:eid',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const program = db.programs.find((p) => p.id === params.id)
      if (!program) return problem(404, 'Programme introuvable.')
      if (program.ownerId !== user.id) return problem(403, 'Réservé au propriétaire.')
      const day = program.days.find((d) => d.id === params.dayId)
      if (!day) return problem(404, 'Jour introuvable.')
      day.exercises = day.exercises.filter((e) => e.id !== params.eid)
      program.updatedAt = new Date().toISOString()
      return HttpResponse.json(program)
    },
  ),

  http.post<{ id: string }, { stars: number; comment?: string }>(
    '*/api/programs/:id/ratings',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const program = db.programs.find((p) => p.id === params.id)
      if (!program) return problem(404, 'Programme introuvable.')
      if (program.ownerId === user.id) return problem(409, 'Vous ne pouvez pas noter votre propre programme.')
      if (program.visibility !== 'PUBLIC') return problem(409, 'Ce programme n’est pas public.')
      const body = await request.json()
      program.ratingsCount += 1
      program.averageRating =
        (program.averageRating * (program.ratingsCount - 1) + body.stars) / program.ratingsCount
      return HttpResponse.json(program)
    },
  ),
]
