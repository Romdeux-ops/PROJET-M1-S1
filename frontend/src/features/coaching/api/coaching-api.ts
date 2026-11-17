import { api, postMultipart, unwrap } from '@/lib/api/client'
import type { SessionUser } from '@/lib/auth/session'

import type {
  AthleteOverview,
  CoachNote,
  CoachPost,
  CreatePostInput,
  InviteAthleteInput,
  Invitation,
  NoteFormInput,
} from '../schemas'

/**
 * Contrat du module coaching (backend) :
 *   POST   /api/coaching/athletes                          -> Invitation (201, PENDING jusqu'a la reponse de l'athlete, role COACH)
 *   GET    /api/coaching/athletes                          -> SessionUser[]   (relations ACTIVE, role COACH)
 *   DELETE /api/coaching/athletes/{athleteId}              -> 204              (le coach met fin a la relation)
 *   GET    /api/coaching/coaches                           -> SessionUser[]   (relations ACTIVE, role ATHLETE)
 *   DELETE /api/coaching/coaches/{coachId}                 -> 204              (l'athlete met fin a la relation)
 *   GET    /api/coaching/invitations/sent                  -> Invitation[]    (role COACH)
 *   DELETE /api/coaching/invitations/sent/{athleteId}      -> 204              (annule une invitation en attente)
 *   GET    /api/coaching/invitations/received              -> Invitation[]    (role ATHLETE)
 *   POST   /api/coaching/invitations/received/{coachId}/accept  -> 204        (relation ACTIVE)
 *   POST   /api/coaching/invitations/received/{coachId}/decline -> 204
 *   GET    /api/coaching/athletes/{athleteId}/overview     -> AthleteOverview (coach de la relation active)
 *   GET    /api/coaching/athletes/{athleteId}/notes        -> PageResponse<CoachNote> (auteur uniquement, jamais l'athlete)
 *   POST   /api/coaching/athletes/{athleteId}/notes        -> CoachNote (201, relation active)
 *   PUT    /api/coaching/athletes/{athleteId}/notes/{noteId} -> CoachNote (auteur, relation active)
 *   DELETE /api/coaching/athletes/{athleteId}/notes/{noteId} -> 204        (auteur)
 *   POST   /api/coaching/posts                             -> CoachPost (201, role COACH)
 *   POST   /api/coaching/posts/images                      -> { imageUrl } chemin relatif a passer a createPost (role COACH)
 *   GET    /api/coaching/posts/images/{coachId}/{fichier}  -> image (le coach ou ses clients actifs, via AuthorizedImage)
 *   GET    /api/coaching/posts/{coachId}                   -> CoachPost[]     (le coach ou ses clients actifs)
 *   DELETE /api/coaching/posts/{postId}                    -> 204              (auteur uniquement)
 */
export const coachingApi = {
  inviteAthlete: (input: InviteAthleteInput) =>
    unwrap(api.POST('/api/coaching/athletes', { body: input })) as Promise<Invitation>,
  listAthletes: () => unwrap(api.GET('/api/coaching/athletes')) as Promise<SessionUser[]>,
  endAthlete: (athleteId: string) =>
    unwrap(api.DELETE('/api/coaching/athletes/{athleteId}', { params: { path: { athleteId } } })),
  listCoaches: () => unwrap(api.GET('/api/coaching/coaches')) as Promise<SessionUser[]>,
  endCoach: (coachId: string) =>
    unwrap(api.DELETE('/api/coaching/coaches/{coachId}', { params: { path: { coachId } } })),

  listSentInvitations: () =>
    unwrap(api.GET('/api/coaching/invitations/sent')) as Promise<Invitation[]>,
  cancelInvitation: (athleteId: string) =>
    unwrap(
      api.DELETE('/api/coaching/invitations/sent/{athleteId}', {
        params: { path: { athleteId } },
      }),
    ),
  listReceivedInvitations: () =>
    unwrap(api.GET('/api/coaching/invitations/received')) as Promise<Invitation[]>,
  acceptInvitation: (coachId: string) =>
    unwrap(
      api.POST('/api/coaching/invitations/received/{coachId}/accept', {
        params: { path: { coachId } },
      }),
    ),
  declineInvitation: (coachId: string) =>
    unwrap(
      api.POST('/api/coaching/invitations/received/{coachId}/decline', {
        params: { path: { coachId } },
      }),
    ),

  getOverview: (athleteId: string) =>
    unwrap(
      api.GET('/api/coaching/athletes/{athleteId}/overview', { params: { path: { athleteId } } }),
    ) as Promise<AthleteOverview>,
  listNotes: async (athleteId: string) => {
    const page = await unwrap(
      api.GET('/api/coaching/athletes/{athleteId}/notes', {
        params: { path: { athleteId }, query: { size: 100 } },
      }),
    )
    return page.content as CoachNote[]
  },
  createNote: (athleteId: string, input: NoteFormInput) =>
    unwrap(
      api.POST('/api/coaching/athletes/{athleteId}/notes', {
        params: { path: { athleteId } },
        body: input,
      }),
    ) as Promise<CoachNote>,
  updateNote: (athleteId: string, noteId: string, input: NoteFormInput) =>
    unwrap(
      api.PUT('/api/coaching/athletes/{athleteId}/notes/{noteId}', {
        params: { path: { athleteId, noteId } },
        body: input,
      }),
    ) as Promise<CoachNote>,
  deleteNote: (athleteId: string, noteId: string) =>
    unwrap(
      api.DELETE('/api/coaching/athletes/{athleteId}/notes/{noteId}', {
        params: { path: { athleteId, noteId } },
      }),
    ),

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
