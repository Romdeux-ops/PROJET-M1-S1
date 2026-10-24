import { http } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { SessionUser } from '@/lib/auth/session'
import { useSession } from '@/lib/auth/session'

import type { AddAthleteInput, CoachPost, CreatePostInput } from '../schemas'

const baseUrl = import.meta.env.VITE_API_URL || window.location.origin

/**
 * Contrat attendu du module coaching (backend) :
 *   POST   /api/coaching/athletes          -> SessionUser (201)
 *   GET    /api/coaching/athletes          -> SessionUser[]   (role COACH)
 *   GET    /api/coaching/coaches           -> SessionUser[]   (role ATHLETE)
 *   POST   /api/coaching/posts             -> CoachPost (201, role COACH)
 *   POST   /api/coaching/posts/images      -> { imageUrl } (role COACH)
 *   GET    /api/coaching/posts/{coachId}   -> CoachPost[]     (le coach ou ses clients actifs)
 *   DELETE /api/coaching/posts/{postId}    -> 204              (auteur uniquement)
 */
export const coachingApi = {
  addAthlete: (input: AddAthleteInput) => http.post<SessionUser>('/api/coaching/athletes', input),
  listAthletes: () => http.get<SessionUser[]>('/api/coaching/athletes'),
  listCoaches: () => http.get<SessionUser[]>('/api/coaching/coaches'),
  createPost: (input: CreatePostInput) => http.post<CoachPost>('/api/coaching/posts', input),
  listPosts: (coachId: string) => http.get<CoachPost[]>(`/api/coaching/posts/${coachId}`),
  deletePost: (postId: string) => http.delete(`/api/coaching/posts/${postId}`),
  uploadPostImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = useSession.getState().token
    const response = await fetch(new URL('/api/coaching/posts/images', baseUrl), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    })
    if (!response.ok) throw await toApiError(response)
    return (await response.json()) as { imageUrl: string }
  },
}
