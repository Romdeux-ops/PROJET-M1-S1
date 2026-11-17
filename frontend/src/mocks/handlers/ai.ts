import { http, HttpResponse } from 'msw'

import type { GeneratedProgram, GenerationFormInput } from '@/features/ai/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

/** Programme figé construit sur les exercices du catalogue simulé : démo et tests sans clé d'API. */
export const aiHandlers = [
  http.post<never, GenerationFormInput & { variant?: number }>(
    '*/api/ai/program-generation',
    async ({ request }) => {
      await networkDelay()
      if (!userFromRequest(request)) return problem(401, 'Session invalide.')
      const body = await request.json()
      const [first, second, third] = db.exercises
      if (!first || !second || !third) return problem(503, 'Le catalogue est vide.')

      const variant = body.variant ?? 0
      const pool = [first, second, third]
      const rotated = pool.map((_, i) => pool[(i + variant) % pool.length]!)

      const days = Array.from({ length: body.sessionsPerWeek }, (_, index) => ({
        label: `Jour ${index + 1} – Full body`,
        exercises: rotated.map((exercise) => ({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: 3,
          reps: '10',
          restSeconds: 90,
        })),
      }))
      const draft: GeneratedProgram = {
        name: 'Programme généré',
        description: `Programme généré par règles à partir du catalogue d'exercices (sans IA) : ${body.sessionsPerWeek} séance(s) par semaine.${variant > 0 ? ` Variante ${variant + 1}.` : ''}`,
        category: 'STRENGTH',
        level: body.level,
        source: 'RULES',
        days,
      }
      return HttpResponse.json(draft)
    },
  ),
]
