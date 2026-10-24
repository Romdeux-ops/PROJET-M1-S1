import { z } from 'zod'

export interface SessionSetEntry {
  id: string
  exerciseId: string
  exerciseName: string
  position: number
  setNumber: number
  reps: number
  weightKg: number
  rpe: number | null
  restSeconds: number | null
  volume: number
  isPersonalRecord: boolean
}

/** Seance telle que renvoyee par GET /api/training/sessions. */
export interface TrainingSession {
  id: string
  title: string
  /** Date-heure ISO. */
  performedAt: string
  durationMinutes: number | null
  notes?: string | null
  programId?: string | null
  programDayId?: string | null
  sets: SessionSetEntry[]
  totalVolume: number
}

export const createSessionSchema = z.object({
  title: z.string().trim().min(2, '2 caractères minimum').max(80, '80 caractères maximum'),
  performedAt: z.string().min(1, 'Date requise'),
  durationMinutes: z.number().int().min(0).max(600).optional(),
  notes: z.string().trim().max(2000, '2000 caractères maximum').optional(),
})
export type CreateSessionInput = z.infer<typeof createSessionSchema>

export interface SessionFilters {}

export const addSetSchema = z.object({
  exerciseId: z.string().min(1, 'Choisissez un exercice'),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(1).max(200),
  weightKg: z.number().min(0),
  rpe: z.number().min(1).max(10).optional(),
  restSeconds: z.number().int().min(0).max(1200).optional(),
})
export type AddSetInput = z.infer<typeof addSetSchema>

export const personalRecordMetrics = ['MAX_WEIGHT', 'ESTIMATED_1RM'] as const
export type PersonalRecordMetric = (typeof personalRecordMetrics)[number]

export const METRIC_LABELS: Record<PersonalRecordMetric, string> = {
  MAX_WEIGHT: 'Charge max',
  ESTIMATED_1RM: '1RM estimé',
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  metric: PersonalRecordMetric
  value: number
  achievedAt: string
}
