import { z } from 'zod'

export const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const
export type Difficulty = (typeof difficulties)[number]

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
}

export const muscleRoles = ['PRIMARY', 'SECONDARY'] as const
export type MuscleRole = (typeof muscleRoles)[number]

export const MUSCLE_ROLE_LABELS: Record<MuscleRole, string> = {
  PRIMARY: 'Principal',
  SECONDARY: 'Secondaire',
}

export interface MuscleGroup {
  id: string
  code: string
  name: string
}

export interface Tag {
  id: string
  code: string
  name: string
}

export interface ExerciseMuscle {
  muscleGroupId: string
  muscleGroupCode: string
  muscleGroupName: string
  role: MuscleRole
}

export interface Exercise {
  id: string
  slug: string
  name: string
  description: string | null
  equipment: string | null
  difficulty: Difficulty
  defaultRestSeconds: number
  mediaUrl: string | null
  muscles: ExerciseMuscle[]
  tags: Tag[]
  alternativeExerciseIds: string[]
  createdAt: string
  updatedAt: string
}

export const exerciseMuscleInputSchema = z.object({
  muscleGroupId: z.string().min(1),
  role: z.enum(muscleRoles),
})

export const exerciseFormSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(150),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  equipment: z.string().trim().max(150).optional().or(z.literal('')),
  difficulty: z.enum(difficulties),
  defaultRestSeconds: z.number().int().min(0).max(1200),
  mediaUrl: z.string().trim().max(500).optional().or(z.literal('')),
  muscles: z.array(exerciseMuscleInputSchema),
  tagIds: z.array(z.string()),
  alternativeExerciseIds: z.array(z.string()),
})

export type ExerciseFormInput = z.infer<typeof exerciseFormSchema>

export interface ExerciseSearchFilters {
  query?: string
  muscleGroupId?: string
  tagId?: string
  difficulty?: Difficulty
}
