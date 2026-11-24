import { z } from 'zod'

/** Le backend compare les e-mails sans tenir compte de la casse ; on envoie la forme canonique. */
const emailField = z.string().trim().toLowerCase().pipe(z.email('Adresse e-mail invalide'))

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Mot de passe requis'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Prénom requis').max(50),
    lastName: z.string().trim().min(1, 'Nom requis').max(50),
    email: emailField,
    role: z.enum(['ATHLETE', 'COACH']),
    password: z
      .string()
      .min(8, '8 caractères minimum')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/\d/, 'Au moins un chiffre'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
export type RegisterInput = z.infer<typeof registerSchema>

export const fitnessGoals = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'GENERAL_FITNESS'] as const
export const experienceLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const
export const unitSystems = ['METRIC', 'IMPERIAL'] as const
export const locales = ['fr', 'en'] as const

export const FITNESS_GOAL_LABELS: Record<(typeof fitnessGoals)[number], string> = {
  WEIGHT_LOSS: 'Perte de poids',
  MUSCLE_GAIN: 'Prise de muscle',
  ENDURANCE: 'Endurance',
  GENERAL_FITNESS: 'Forme générale',
}

export const EXPERIENCE_LEVEL_LABELS: Record<(typeof experienceLevels)[number], string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
}

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(50),
  lastName: z.string().trim().min(1, 'Nom requis').max(50),
  bio: z.string().max(1000).optional().or(z.literal('')),
  fitnessGoal: z.enum(fitnessGoals),
  experienceLevel: z.enum(experienceLevels),
  unitSystem: z.enum(unitSystems),
  locale: z.enum(locales),
  notificationsEnabled: z.boolean(),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export interface ProfileResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: ('ATHLETE' | 'COACH' | 'ADMIN')[]
  avatarUrl: string | null
  bio: string | null
  birthDate: string | null
  heightCm: number | null
  fitnessGoal: (typeof fitnessGoals)[number]
  experienceLevel: (typeof experienceLevels)[number]
  unitSystem: (typeof unitSystems)[number]
  locale: (typeof locales)[number]
  notificationsEnabled: boolean
}
