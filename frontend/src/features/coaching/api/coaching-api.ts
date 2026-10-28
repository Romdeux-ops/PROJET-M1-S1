import { api, postMultipart, unwrap } from '@/lib/api/client'
import type { SessionUser } from '@/lib/auth/session'

import type { AddAthleteInput, CoachPost, CreatePostInput } from '../schemas'

/**
 * Contrat du module coaching (backend) :
 *   POST   /api/coaching/athletes                          -> SessionUser (201)
 *   GET    /api/coaching/athletes                          -> SessionUser[]   (role COACH)
 *   GET    /api/coaching/coaches                           -> SessionUser[]   (role ATHLETE)
 *   POST   /api/coaching/posts                             -> CoachPost (201, role COACH)
 *   POST   /api/coaching/posts/images                      -> { imageUrl } chemin relatif a passer a createPost (role COACH)
 *   GET    /api/coaching/posts/images/{coachId}/{fichier}  -> image (le coach ou ses clients actifs, via AuthorizedImage)
 *   GET    /api/coaching/posts/{coachId}                   -> CoachPost[]     (le coach ou ses clients actifs)
 *   DELETE /api/coaching/posts/{postId}                    -> 204              (auteur uniquement)
 */
export const coachingApi = {
  addAthlete: (input: AddAthleteInput) =>
    unwrap(api.POST('/api/coaching/athletes', { body: input })) as Promise<SessionUser>,
  listAthletes: () => unwrap(api.GET('/api/coaching/athletes')) as Promise<SessionUser[]>,
  listCoaches: () => unwrap(api.GET('/api/coaching/coaches')) as Promise<SessionUser[]>,
  createPost: (input: CreatePostInput) =>
    unwrap(api.POST('/api/coaching/posts', { body: input })) as Promise<CoachPost>,
  listPosts: (coachId: string) =>
    unwrap(api.GET('/api/coaching/posts/{coachId}', { params: { path: { coachId } } })) as Promise<
      CoachPost[]
    >,
  deletePost: (postId: string) =>
    unwrap(api.DELETE('/api/coaching/posts/{postId}', { params: { path: { postId } } })),
  uploadPostImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return postMultipart<{ imageUrl: string }>('/api/coaching/posts/images', formData)
  },
}
