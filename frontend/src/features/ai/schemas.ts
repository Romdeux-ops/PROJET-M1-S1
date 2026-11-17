import { z } from 'zod'

import { type ProgramCategory, type ProgramLevel, programLevels } from '@/features/program'

export const generationGoals = [
  'WEIGHT_LOSS',
  'MUSCLE_GAIN',
  'ENDURANCE',
  'GENERAL_FITNESS',
] as const
export type GenerationGoal = (typeof generationGoals)[number]

export const GOAL_LABELS: Record<GenerationGoal, string> = {
  WEIGHT_LOSS: 'Perte de poids',
  MUSCLE_GAIN: 'Prise de muscle',
  ENDURANCE: 'Endurance',
  GENERAL_FITNESS: 'Forme générale',
}

export const generationFormSchema = z.object({
  goal: z.enum(generationGoals),
  level: z.enum(programLevels),
  sessionsPerWeek: z.number().int().min(1).max(7),
  equipment: z.string().trim().max(300).optional().or(z.literal('')),
  constraints: z.string().trim().max(500).optional().or(z.literal('')),
})
export type GenerationFormInput = z.infer<typeof generationFormSchema>

export interface GeneratedExercise {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: string
  restSeconds: number
}

export interface GeneratedDay {
  label: string
  exercises: GeneratedExercise[]
}

/** Brouillon renvoyé par l'API : rien n'est enregistré tant que l'utilisateur ne le confirme pas. */
export interface GeneratedProgram {
  name: string
  description: string
  category: ProgramCategory
  level: ProgramLevel
  days: GeneratedDay[]
}
