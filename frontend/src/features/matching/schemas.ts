import { z } from 'zod'

/** Codes stables renvoyes par l'API ; leur traduction est faite ici. */
export const SPORTS = [
  'STRENGTH',
  'RUNNING',
  'CYCLING',
  'SWIMMING',
  'CROSSFIT',
  'HIIT',
  'YOGA',
  'PILATES',
  'BOXING',
  'MARTIAL_ARTS',
  'CLIMBING',
  'TRIATHLON',
  'FOOTBALL',
  'BASKETBALL',
  'TENNIS',
  'DANCE',
] as const
export type Sport = (typeof SPORTS)[number]

export const SPORT_LABELS: Record<Sport, string> = {
  STRENGTH: 'Musculation',
  RUNNING: 'Course à pied',
  CYCLING: 'Vélo',
  SWIMMING: 'Natation',
  CROSSFIT: 'CrossFit',
  HIIT: 'HIIT',
  YOGA: 'Yoga',
  PILATES: 'Pilates',
  BOXING: 'Boxe',
  MARTIAL_ARTS: 'Arts martiaux',
  CLIMBING: 'Escalade',
  TRIATHLON: 'Triathlon',
  FOOTBALL: 'Football',
  BASKETBALL: 'Basket',
  TENNIS: 'Tennis',
  DANCE: 'Danse',
}

export const SLOTS = ['MORNING', 'NOON', 'EVENING', 'WEEKEND'] as const
export type Slot = (typeof SLOTS)[number]
export const SLOT_LABELS: Record<Slot, string> = {
  MORNING: 'Matin',
  NOON: 'Midi',
  EVENING: 'Soir',
  WEEKEND: 'Week-end',
}

export const TRAINING_MODES = ['ONSITE', 'REMOTE', 'BOTH'] as const
export type TrainingMode = (typeof TRAINING_MODES)[number]
export const TRAINING_MODE_LABELS: Record<TrainingMode, string> = {
  ONSITE: 'En présentiel',
  REMOTE: 'À distance',
  BOTH: 'Présentiel ou distance',
}

export const GOALS = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'GENERAL_FITNESS'] as const
export type Goal = (typeof GOALS)[number]
export const GOAL_LABELS: Record<Goal, string> = {
  WEIGHT_LOSS: 'Perte de poids',
  MUSCLE_GAIN: 'Prise de muscle',
  ENDURANCE: 'Endurance',
  GENERAL_FITNESS: 'Forme générale',
}

export const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const
export type Level = (typeof LEVELS)[number]
export const LEVEL_LABELS: Record<Level, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
}

export const REASON_LABELS: Record<string, string> = {
  SHARED_SPORTS: 'Mêmes sports',
  GOAL_SUPPORTED: 'Objectif compatible',
  LEVEL_SUPPORTED: 'Niveau compatible',
  SHARED_AVAILABILITY: 'Créneaux communs',
  SAME_CITY: 'Même ville',
  REMOTE_POSSIBLE: 'À distance possible',
  WITHIN_BUDGET: 'Dans le budget',
}

export type MatchSide = 'ATHLETE' | 'COACH'
export type SwipeDecision = 'LIKE' | 'SUPER_LIKE' | 'PASS'

export const MINIMUM_AGE = 16

export interface MatchProfileDetails {
  headline: string
  about: string | null
  sports: Sport[]
  goals: Goal[]
  levels: Level[]
  availability: Slot[]
  trainingMode: TrainingMode
  city: string | null
  maxBudgetEur: number | null
  sessionRateEur: number | null
  visible: boolean
}

/** `GET/PUT /api/matching/profile` : `profile` est nul tant que l'inscription n'est pas faite. */
export interface MyMatchProfile {
  side: MatchSide
  firstName: string
  avatarUrl: string | null
  birthDate: string | null
  age: number | null
  heightCm: number | null
  fitnessGoal: Goal
  experienceLevel: Level
  missing: ('BIRTH_DATE' | 'HEIGHT')[]
  profile: MatchProfileDetails | null
}

export interface Candidate {
  userId: string
  side: MatchSide
  firstName: string
  age: number | null
  heightCm: number | null
  avatarUrl: string | null
  headline: string
  about: string | null
  sports: Sport[]
  goals: Goal[]
  levels: Level[]
  availability: Slot[]
  trainingMode: TrainingMode
  city: string | null
  sessionRateEur: number | null
  score: number
  reasons: string[]
  superLikedYou: boolean
}

export interface Match {
  id: string
  counterpartId: string
  counterpartSide: MatchSide
  counterpartFirstName: string
  counterpartAge: number | null
  counterpartAvatarUrl: string | null
  counterpartHeadline: string | null
  counterpartSports: Sport[]
  createdAt: string
}

export interface SwipeResult {
  decision: SwipeDecision
  match: Match | null
  /** Vrai seulement pour le swipe qui vient de creer le match. */
  newMatch: boolean
}

export const MAXIMUM_AGE = 120

/**
 * Age revolu a la date locale `today` pour une date `YYYY-MM-DD`. La date est
 * lue a la main : `new Date('2010-05-20')` serait minuit UTC, donc la veille
 * pour un navigateur a l'ouest de Greenwich, ce qui decalerait l'anniversaire.
 */
export function ageFromIsoDate(birthDate: string, today = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  let age = today.getFullYear() - year
  const beforeBirthday =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)
  if (beforeBirthday) age -= 1
  return age
}

const optionalNumber = (min: number, max: number, message: string) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number({ error: message }).min(min, message).max(max, message).optional(),
  )

export const matchProfileFormSchema = z.object({
  birthDate: z
    .string()
    .min(1, 'Votre date de naissance est nécessaire')
    .refine((v) => (ageFromIsoDate(v) ?? -1) >= MINIMUM_AGE, {
      message: `FitMatch est réservé aux ${MINIMUM_AGE} ans et plus`,
    })
    .refine((v) => (ageFromIsoDate(v) ?? 0) <= MAXIMUM_AGE, {
      message: 'Cette date de naissance semble erronée',
    }),
  // Memes regles que le profil du compte : ]0 ; 300[ cm, une decimale au plus.
  heightCm: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({ error: 'Taille invalide' })
      .gt(0, 'Taille invalide')
      .lt(300, 'La taille doit être inférieure à 300 cm')
      .refine((v) => Number.isInteger(v * 10), 'Une décimale au plus')
      .optional(),
  ),
  headline: z
    .string()
    .trim()
    .min(1, 'Présentez-vous en une phrase')
    .max(120, '120 caractères maximum'),
  about: z.string().max(1000, '1000 caractères maximum').optional(),
  sports: z.array(z.enum(SPORTS)).min(1, 'Choisissez au moins un sport').max(8, '8 sports maximum'),
  goals: z.array(z.enum(GOALS)),
  levels: z.array(z.enum(LEVELS)),
  availability: z.array(z.enum(SLOTS)).min(1, 'Choisissez au moins un créneau'),
  trainingMode: z.enum(TRAINING_MODES),
  city: z.string().trim().max(80, '80 caractères maximum').optional(),
  maxBudgetEur: optionalNumber(0, 1000, 'Entre 0 et 1000 €'),
  sessionRateEur: optionalNumber(0, 1000, 'Entre 0 et 1000 €'),
  visible: z.boolean(),
})
export type MatchProfileFormInput = z.input<typeof matchProfileFormSchema>
export type MatchProfileFormValues = z.output<typeof matchProfileFormSchema>
