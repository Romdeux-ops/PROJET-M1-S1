import { z } from 'zod'

export const SESSION_TYPES = ['STRENGTH', 'CARDIO', 'HIIT', 'MOBILITY'] as const
export type SessionType = (typeof SESSION_TYPES)[number]

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  STRENGTH: 'Force',
  CARDIO: 'Cardio',
  HIIT: 'HIIT',
  MOBILITY: 'Mobilité',
}

/** Seance telle que renvoyee par GET /api/training/sessions. */
export interface TrainingSession {
  id: string
  title: string
  type: SessionType
  /** Date au format ISO `yyyy-mm-dd`. */
  date: string
  durationMinutes: number
  /** Ressenti de l'effort (RPE) de 1 a 10. */
  perceivedEffort: number
  exerciseCount: number
  notes?: string | null
}

export const createSessionSchema = z.object({
  title: z.string().trim().min(2, '2 caractères minimum').max(80, '80 caractères maximum'),
  type: z.enum(SESSION_TYPES),
  date: z.string().min(1, 'Date requise'),
  durationMinutes: z
    .number({ error: 'Durée requise' })
    .int()
    .min(5, '5 minutes minimum')
    .max(600, '10 heures maximum'),
  perceivedEffort: z.number().int().min(1).max(10),
  notes: z.string().trim().max(500, '500 caractères maximum').optional(),
})
export type CreateSessionInput = z.infer<typeof createSessionSchema>

export interface SessionFilters {
  type?: SessionType
}
