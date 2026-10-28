import { z } from 'zod'

import type { SessionUser } from '@/lib/auth/session'

export const addAthleteSchema = z.object({
  athleteEmail: z.email('Adresse e-mail invalide'),
})
export type AddAthleteInput = z.infer<typeof addAthleteSchema>

export const createPostSchema = z.object({
  content: z.string().trim().min(1, 'Le contenu est requis').max(5000),
})
export type CreatePostInput = z.infer<typeof createPostSchema> & { imageUrl?: string }

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
