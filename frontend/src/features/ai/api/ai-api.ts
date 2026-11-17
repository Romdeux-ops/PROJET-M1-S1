import { programApi } from '@/features/program'
import { api, unwrap } from '@/lib/api/client'

import type { GeneratedProgram, GenerationFormInput } from '../schemas'

/**
 * Contrat attendu du module IA (backend) :
 *   POST /api/ai/program-generation -> GeneratedProgram (brouillon, rien n'est écrit en base ; 503 si l'IA n'est pas configurée)
 */
export const aiApi = {
  generate: (input: GenerationFormInput) =>
    unwrap(
      api.POST('/api/ai/program-generation', {
        body: {
          goal: input.goal,
          level: input.level,
          sessionsPerWeek: input.sessionsPerWeek,
          equipment: input.equipment || undefined,
          constraints: input.constraints || undefined,
        },
      }),
    ) as Promise<GeneratedProgram>,

  /**
   * Enregistre un brouillon via l'API des programmes existante : création du
   * programme (privé), puis chaque jour, puis chaque exercice prescrit.
   */
  async save(draft: GeneratedProgram) {
    let program = await programApi.create({
      title: draft.name,
      description: draft.description,
      category: draft.category,
      level: draft.level,
      visibility: 'PRIVATE',
    })
    for (const day of draft.days) {
      program = await programApi.addDay(program.id, { name: day.label, restDay: false })
      const created = program.days.reduce((latest, d) =>
        d.position > latest.position ? d : latest,
      )
      for (const item of day.exercises) {
        program = await programApi.addExercise(program.id, created.id, {
          exerciseId: item.exerciseId,
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.restSeconds,
        })
      }
    }
    return program
  },
}
