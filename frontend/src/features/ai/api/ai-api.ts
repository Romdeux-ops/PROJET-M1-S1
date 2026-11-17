import { programApi } from '@/features/program'
import { api, unwrap } from '@/lib/api/client'

import type { GeneratedProgram, GenerationFormInput } from '../schemas'

/**
 * Contrat attendu du module IA (backend) :
 *   POST /api/ai/program-generation -> GeneratedProgram (brouillon, rien n'est écrit en base). `source` vaut RULES (générateur à règles,
 *   sans clé) ou CLAUDE (clé ANTHROPIC_API_KEY côté serveur) ; `variant` fait tourner la sélection des règles (Régénérer = variant + 1).
 *   503 si la stratégie `claude` est forcée sans clé, ou si Claude est indisponible.
 */
export const aiApi = {
  generate: (input: GenerationFormInput, variant = 0) =>
    unwrap(
      api.POST('/api/ai/program-generation', {
        body: {
          goal: input.goal,
          level: input.level,
          sessionsPerWeek: input.sessionsPerWeek,
          equipment: input.equipment || undefined,
          constraints: input.constraints || undefined,
          variant,
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
