import { http, HttpResponse } from 'msw'

import type { GeneratedProgram, GenerationFormInput } from '@/features/ai/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

/** Programme figé construit sur les exercices du catalogue simulé : démo et tests sans clé d'API. */
export const aiHandlers = [
  http.post<never, GenerationFormInput>('*/api/ai/program-generation', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    const body = await request.json()
    const [first, second, third] = db.exercises
    if (!first || !second || !third) return problem(503, 'Le catalogue est vide.')

    const days = Array.from({ length: body.sessionsPerWeek }, (_, index) => ({
      label: `Séance ${index + 1}`,
      exercises: [first, second, third].map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: 3,
        reps: '10',
        restSeconds: 90,
      })),
    }))
    const draft: GeneratedProgram = {
      name: 'Programme généré',
      description: `Programme de ${body.sessionsPerWeek} séance(s) par semaine, généré par l'IA (mock).`,
      category: 'STRENGTH',
      level: body.level,
      days,
    }
    return HttpResponse.json(draft)
  }),
]
