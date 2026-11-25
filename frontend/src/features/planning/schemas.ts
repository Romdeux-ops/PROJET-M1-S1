import { z } from 'zod'

export const scheduledStatuses = ['PLANNED', 'PENDING_VALIDATION', 'DONE', 'SKIPPED'] as const
export type ScheduledStatus = (typeof scheduledStatuses)[number]

export const STATUS_LABELS: Record<ScheduledStatus, string> = {
  PLANNED: 'Prévu',
  PENDING_VALIDATION: 'En attente de validation',
  DONE: 'Réalisé',
  SKIPPED: 'Sauté',
}

export interface ScheduledSession {
  id: string
  title: string
  scheduledDate: string
  status: ScheduledStatus
  programId: string | null
  programDayId: string | null
  workoutSessionId: string | null
  notes: string | null
  athleteId: string
  athleteName: string | null
}

export const scheduleFormSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis').max(150),
  scheduledDate: z.string().min(1, 'La date est requise'),
  /** Vide = seance libre. Le jour n'a de sens qu'avec un programme. */
  programId: z.string().optional().or(z.literal('')),
  programDayId: z.string().optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})
export type ScheduleFormInput = z.infer<typeof scheduleFormSchema>
