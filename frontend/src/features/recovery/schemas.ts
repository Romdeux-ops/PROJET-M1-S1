import { z } from 'zod'

export const activityTypes = [
  'STRENGTH',
  'CARDIO',
  'HIIT',
  'RUNNING',
  'CYCLING',
  'WALKING',
  'SWIMMING',
  'YOGA',
  'STRETCHING',
  'OTHER',
] as const

const optionalNotes = z.string().trim().max(2000, '2000 caractères maximum').optional()

const dateSchema = z.iso.date()

const dateTimeSchema = z
  .string()
  .refine(
    (value) => value.length > 0 && Number.isFinite(Date.parse(value)),
    'Date et heure invalides',
  )

const levelSchema = z
  .number()
  .int()
  .min(0, 'La valeur minimale est 0')
  .max(10, 'La valeur maximale est 10')

// Journal du sommeil

export const sleepLogSchema = z
  .object({
    bedtime: dateTimeSchema,
    wakeTime: dateTimeSchema,

    awakeMinutes: z.number().int().min(0).max(1440).optional(),

    sleepQuality: z.number().int().min(1).max(10),

    nightAwakenings: z.number().int().min(0).max(100).optional(),

    notes: optionalNotes,
  })
  .superRefine((values, ctx) => {
    const bedtime = Date.parse(values.bedtime)
    const wakeTime = Date.parse(values.wakeTime)

    if (!Number.isFinite(bedtime) || !Number.isFinite(wakeTime)) {
      return
    }

    const now = Date.now()
    const durationMinutes = (wakeTime - bedtime) / 60_000

    if (bedtime > now) {
      ctx.addIssue({
        code: 'custom',
        path: ['bedtime'],
        message: "L'heure de coucher ne peut pas être future.",
      })
    }

    if (wakeTime > now) {
      ctx.addIssue({
        code: 'custom',
        path: ['wakeTime'],
        message: "L'heure de réveil ne peut pas être future.",
      })
    }

    if (durationMinutes <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['wakeTime'],
        message: 'Le réveil doit être postérieur au coucher.',
      })
    }

    if (durationMinutes > 1440) {
      ctx.addIssue({
        code: 'custom',
        path: ['wakeTime'],
        message: 'La durée ne peut pas dépasser 24 heures.',
      })
    }

    if (
      durationMinutes > 0 &&
      values.awakeMinutes !== undefined &&
      values.awakeMinutes > durationMinutes
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['awakeMinutes'],
        message: 'La durée éveillée dépasse le temps passé au lit.',
      })
    }
  })

export type SleepLogInput = z.infer<typeof sleepLogSchema>

// Questionnaire quotidien

export const recoveryCheckinSchema = z.object({
  checkinDate: dateSchema,
  energyLevel: levelSchema,
  fatigueLevel: levelSchema,
  stressLevel: levelSchema,
  muscleSoreness: levelSchema,
  notes: optionalNotes,
})

export type RecoveryCheckinInput = z.infer<typeof recoveryCheckinSchema>

// Paramètres

export const recoverySettingsSchema = z.object({
  sleepTargetMinutes: z
    .number()
    .int()
    .min(240, 'Objectif minimum : 4 heures')
    .max(720, 'Objectif maximum : 12 heures'),
})

export type RecoverySettingsInput = z.infer<typeof recoverySettingsSchema>

// Informations complémentaires d'une séance

export const recoveryWorkoutDetailsSchema = z.object({
  activityType: z.enum(activityTypes).optional(),

  sessionRpe: z
    .number()
    .min(1, 'Le RPE minimum est 1')
    .max(10, 'Le RPE maximum est 10')
    .refine((value) => Math.abs(value * 10 - Math.round(value * 10)) < 1e-8, 'Une décimale maximum')
    .optional(),
})

export type RecoveryWorkoutDetailsInput = z.infer<typeof recoveryWorkoutDetailsSchema>

// Poids corporel

export const bodyWeightSchema = z.object({
  measuredOn: dateSchema,

  weightKg: z
    .number()
    .gt(0, 'Le poids doit être strictement positif')
    .lt(500, 'Le poids doit être inférieur à 500 kg')
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8,
      'Deux décimales maximum',
    ),

  note: optionalNotes,
})

export type BodyWeightInput = z.infer<typeof bodyWeightSchema>

// Période de consultation

export const recoveryDateRangeSchema = z
  .object({
    from: dateSchema,
    to: dateSchema,
  })
  .superRefine((values, ctx) => {
    if (values.from > values.to) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: 'La date de fin doit suivre la date de début.',
      })

      return
    }

    const days = (Date.parse(values.to) - Date.parse(values.from)) / 86_400_000 + 1

    if (days > 366) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: 'La période ne peut pas dépasser 366 jours.',
      })
    }
  })

export type RecoveryDateRangeInput = z.infer<typeof recoveryDateRangeSchema>
