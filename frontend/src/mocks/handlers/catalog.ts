import { http, HttpResponse } from 'msw'

import type { Exercise, ExerciseFormInput } from '@/features/catalog/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

export const catalogHandlers = [
  http.get('*/api/catalog/muscle-groups', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return HttpResponse.json(db.muscleGroups)
  }),

  http.get('*/api/catalog/tags', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return HttpResponse.json(db.tags)
  }),

  http.get('*/api/catalog/exercises', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const url = new URL(request.url)
    const query = url.searchParams.get('query')?.toLowerCase()
    const muscleGroupId = url.searchParams.get('muscleGroupId')
    const tagId = url.searchParams.get('tagId')
    const difficulty = url.searchParams.get('difficulty')
    let results = [...db.exercises]
    if (query) results = results.filter((e) => e.name.toLowerCase().includes(query))
    if (muscleGroupId) results = results.filter((e) => e.muscles.some((m) => m.muscleGroupId === muscleGroupId))
    if (tagId) results = results.filter((e) => e.tags.some((t) => t.id === tagId))
    if (difficulty) results = results.filter((e) => e.difficulty === difficulty)
    return HttpResponse.json({
      content: results,
      page: 0,
      size: results.length,
      totalElements: results.length,
      totalPages: 1,
    })
  }),

  http.get<{ id: string }>('*/api/catalog/exercises/:id', async ({ request, params }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const exercise = db.exercises.find((e) => e.id === params.id)
    if (!exercise) return problem(404, 'Exercice introuvable.')
    return HttpResponse.json(exercise)
  }),

  http.post<never, ExerciseFormInput>('*/api/catalog/exercises', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.some((r) => r === 'COACH' || r === 'ADMIN'))
      return problem(403, 'Réservé aux coachs et administrateurs.')
    const body = await request.json()
    const exercise: Exercise = {
      id: crypto.randomUUID(),
      slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: body.name,
      description: body.description || null,
      equipment: body.equipment || null,
      difficulty: body.difficulty,
      defaultRestSeconds: body.defaultRestSeconds,
      mediaUrl: body.mediaUrl || null,
      muscles: body.muscles.map((m) => {
        const group = db.muscleGroups.find((g) => g.id === m.muscleGroupId)
        return {
          muscleGroupId: m.muscleGroupId,
          muscleGroupCode: group?.code ?? '',
          muscleGroupName: group?.name ?? '',
          role: m.role,
        }
      }),
      tags: db.tags.filter((t) => body.tagIds.includes(t.id)),
      alternativeExerciseIds: body.alternativeExerciseIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.exercises.unshift(exercise)
    return HttpResponse.json(exercise, { status: 201 })
  }),

  http.put<{ id: string }, ExerciseFormInput>('*/api/catalog/exercises/:id', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.some((r) => r === 'COACH' || r === 'ADMIN'))
      return problem(403, 'Réservé aux coachs et administrateurs.')
    const exercise = db.exercises.find((e) => e.id === params.id)
    if (!exercise) return problem(404, 'Exercice introuvable.')
    const body = await request.json()
    Object.assign(exercise, {
      name: body.name,
      description: body.description || null,
      equipment: body.equipment || null,
      difficulty: body.difficulty,
      defaultRestSeconds: body.defaultRestSeconds,
      mediaUrl: body.mediaUrl || null,
      tags: db.tags.filter((t) => body.tagIds.includes(t.id)),
      alternativeExerciseIds: body.alternativeExerciseIds,
      updatedAt: new Date().toISOString(),
    })
    return HttpResponse.json(exercise)
  }),

  http.delete<{ id: string }>('*/api/catalog/exercises/:id', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.some((r) => r === 'COACH' || r === 'ADMIN'))
      return problem(403, 'Réservé aux coachs et administrateurs.')
    const index = db.exercises.findIndex((e) => e.id === params.id)
    if (index === -1) return problem(404, 'Exercice introuvable.')
    db.exercises.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
