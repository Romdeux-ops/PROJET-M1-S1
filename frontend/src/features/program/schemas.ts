import { z } from 'zod'

export const programCategories = ['STRENGTH', 'CARDIO', 'HIIT', 'YOGA', 'STRETCHING'] as const
export type ProgramCategory = (typeof programCategories)[number]

export const CATEGORY_LABELS: Record<ProgramCategory, string> = {
  STRENGTH: 'Musculation',
  CARDIO: 'Cardio',
  HIIT: 'HIIT',
  YOGA: 'Yoga',
  STRETCHING: 'Stretching',
}

export const programLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const
export type ProgramLevel = (typeof programLevels)[number]

export const LEVEL_LABELS: Record<ProgramLevel, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
}

export const programVisibilities = ['PRIVATE', 'PUBLIC'] as const
export type ProgramVisibility = (typeof programVisibilities)[number]

export const VISIBILITY_LABELS: Record<ProgramVisibility, string> = {
  PRIVATE: 'Privé',
  PUBLIC: 'Public',
}

export interface ProgramExerciseEntry {
  id: string
  exerciseId: string
  exerciseName: string
  position: number
  sets: number
  reps: string
  restSeconds: number
  notes: string | null
}

export interface ProgramDay {
  id: string
  position: number
  name: string
  restDay: boolean
  exercises: ProgramExerciseEntry[]
}

export interface Program {
  id: string
  ownerId: string
  ownerName: string
  title: string
  description: string | null
  category: ProgramCategory
  level: ProgramLevel
  visibility: ProgramVisibility
  shareToken: string | null
  averageRating: number
  ratingsCount: number
  mine: boolean
  days: ProgramDay[]
  createdAt: string
  updatedAt: string
}

export const programFormSchema = z.object({
  title: z.string().trim().min(2, 'Le titre doit contenir au moins 2 caractères').max(150),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  category: z.enum(programCategories),
  level: z.enum(programLevels),
  visibility: z.enum(programVisibilities),
})
export type ProgramFormInput = z.infer<typeof programFormSchema>

export const dayFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(100),
  restDay: z.boolean(),
})
export type DayFormInput = z.infer<typeof dayFormSchema>

export const exerciseEntryFormSchema = z.object({
  exerciseId: z.string().min(1, 'Choisissez un exercice'),
  sets: z.number().int().min(1).max(20),
  reps: z.string().trim().min(1, 'Requis').max(20),
  restSeconds: z.number().int().min(0).max(1200),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})
export type ExerciseEntryFormInput = z.infer<typeof exerciseEntryFormSchema>

export interface ProgramSearchFilters {
  mineOnly?: boolean
  category?: ProgramCategory
  level?: ProgramLevel
}
