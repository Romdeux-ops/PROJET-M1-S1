import { z } from 'zod'

import type { SessionUser } from '@/lib/auth/session'

export const NOTE_MAX_LENGTH = 5000

/** Invitation du coach a un athlete : tant qu'elle est en attente, aucun droit d'acces n'est ouvert. */
export const inviteAthleteSchema = z.object({
  athleteEmail: z.email('Adresse e-mail invalide'),
})
export type InviteAthleteInput = z.infer<typeof inviteAthleteSchema>

export const createPostSchema = z.object({
  content: z.string().trim().min(1, 'Le contenu est requis').max(5000),
})
export type CreatePostInput = z.infer<typeof createPostSchema> & { imageUrl?: string }

export const noteFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'La note est vide')
    .max(NOTE_MAX_LENGTH, `${NOTE_MAX_LENGTH} caractères maximum`),
})
export type NoteFormInput = z.infer<typeof noteFormSchema>

export interface CoachPost {
  id: string
  coachId: string
  coachName: string
  coachAvatarUrl: string | null
  content: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export type CoachingContact = SessionUser

export interface Invitation {
  coach: SessionUser
  athlete: SessionUser
  invitedAt: string
}

/** Note privee du coach : jamais exposee a l'athlete. */
export interface CoachNote {
  id: string
  athleteId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface UpcomingSession {
  id: string
  title: string
  scheduledDate: string
}

/** Tableau de suivi ; `lastSessionDate` est nul tant que l'athlete n'a jamais enregistre de seance. */
export interface AthleteOverview {
  athlete: SessionUser
  sessionsLast30Days: number
  lastSessionDate: string | null
  currentStreakDays: number
  pendingValidations: number
  upcomingSessions: UpcomingSession[]
}
