import { http, HttpResponse } from 'msw'

import type {
  AthleteOverview,
  PublicCoachProfile,
  PublicProfileSettingsInput,
  ViewerStatus,
  CoachPost,
  CreatePostInput,
  InviteAthleteInput,
  Invitation,
} from '@/features/coaching/schemas'

import { db, type MockUser, toSessionUser, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

/** Image 1x1 servie pour toute image de publication simulee. */
const PLACEHOLDER_PNG = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  ),
  (c) => c.charCodeAt(0),
)

const NOT_A_CLIENT = 'Athlete introuvable parmi vos clients.'
const NO_RELATION = 'Invitation ou relation introuvable.'

function isActiveClient(coachId: string, athleteId: string) {
  return db.coachAthletes.some(
    (c) => c.coachId === coachId && c.athleteId === athleteId && c.status === 'ACTIVE',
  )
}

function findRelation(coachId: string, athleteId: string) {
  return db.coachAthletes.find((c) => c.coachId === coachId && c.athleteId === athleteId)
}

function toInvitation(coach: MockUser, athlete: MockUser, invitedAt?: string): Invitation {
  return {
    coach: toSessionUser(coach),
    athlete: toSessionUser(athlete),
    invitedAt: invitedAt ?? new Date().toISOString(),
  }
}

/** Meme enveloppe que `PageResponse` cote backend. */
function notePage<T>(content: T[]) {
  return { content, page: 0, size: 100, totalElements: content.length, totalPages: 1 }
}

function pendingInvitations(side: 'coach' | 'athlete', userId: string): Invitation[] {
  return db.coachAthletes
    .filter(
      (c) => c.status === 'PENDING' && (side === 'coach' ? c.coachId : c.athleteId) === userId,
    )
    .flatMap((c) => {
      const coach = db.users.find((u) => u.id === c.coachId)
      const athlete = db.users.find((u) => u.id === c.athleteId)
      return coach && athlete ? [toInvitation(coach, athlete, c.invitedAt)] : []
    })
}

function viewerStatusOf(coach: MockUser, viewer: MockUser | undefined): ViewerStatus {
  if (!viewer) return 'ANONYMOUS'
  if (viewer.id === coach.id) return 'SELF'
  if (!viewer.roles.includes('ATHLETE')) return 'NOT_ATHLETE'
  switch (findRelation(coach.id, viewer.id)?.status) {
    case 'ACTIVE':
      return 'ACTIVE'
    case 'REQUESTED':
      return 'REQUESTED'
    case 'PENDING':
      return 'INVITED'
    default:
      return 'NONE'
  }
}

function requestsOf(side: 'coach' | 'athlete', userId: string): Invitation[] {
  return db.coachAthletes
    .filter(
      (c) => c.status === 'REQUESTED' && (side === 'coach' ? c.coachId : c.athleteId) === userId,
    )
    .flatMap((c) => {
      const coach = db.users.find((u) => u.id === c.coachId)
      const athlete = db.users.find((u) => u.id === c.athleteId)
      return coach && athlete ? [toInvitation(coach, athlete, c.invitedAt)] : []
    })
}

function overviewOf(athlete: MockUser): AthleteOverview {
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000
  const recent = db.sessions.filter((s) => new Date(s.performedAt).getTime() >= thirtyDaysAgo)
  const latest = [...db.sessions].sort((a, b) => b.performedAt.localeCompare(a.performedAt))[0]
  return {
    athlete: toSessionUser(athlete),
    sessionsLast30Days: recent.length,
    lastSessionDate: latest ? latest.performedAt.slice(0, 10) : null,
    currentStreakDays: latest && latest.performedAt.slice(0, 10) === today ? 1 : 0,
    pendingValidations: db.scheduledSessions.filter((s) => s.status === 'PENDING_VALIDATION')
      .length,
    upcomingSessions: db.scheduledSessions
      .filter((s) => s.status === 'PLANNED' && s.scheduledDate >= today)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .slice(0, 5)
      .map((s) => ({ id: s.id, title: s.title, scheduledDate: s.scheduledDate })),
  }
}

export const coachingHandlers = [
  http.post<never, InviteAthleteInput>('*/api/coaching/athletes', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
    const body = await request.json()
    const athlete = db.users.find((u) => u.email.toLowerCase() === body.athleteEmail.toLowerCase())
    if (!athlete || !athlete.roles.includes('ATHLETE')) {
      return problem(400, 'Aucun athlète avec cet e-mail.')
    }
    if (athlete.id === user.id) return problem(400, 'Un coach ne peut pas s’inviter lui-même.')
    const relation = findRelation(user.id, athlete.id)
    if (relation?.status === 'ACTIVE') {
      return problem(409, 'Cet athlète fait déjà partie de vos clients.')
    }
    if (relation?.status === 'PENDING') {
      return problem(409, 'Une invitation est déjà en attente pour cet athlète.')
    }
    const invitedAt = new Date().toISOString()
    if (relation) {
      relation.status = 'PENDING'
      relation.invitedAt = invitedAt
    } else {
      db.coachAthletes.push({
        coachId: user.id,
        athleteId: athlete.id,
        status: 'PENDING',
        invitedAt,
      })
    }
    return HttpResponse.json(toInvitation(user, athlete, invitedAt), { status: 201 })
  }),

  http.get('*/api/coaching/athletes', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const ids = db.coachAthletes
      .filter((c) => c.coachId === user.id && c.status === 'ACTIVE')
      .map((c) => c.athleteId)
    return HttpResponse.json(db.users.filter((u) => ids.includes(u.id)).map(toSessionUser))
  }),

  http.delete<{ athleteId: string }>(
    '*/api/coaching/athletes/:athleteId',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      const relation = findRelation(user.id, params.athleteId)
      if (relation?.status !== 'ACTIVE') return problem(404, NO_RELATION)
      relation.status = 'ENDED'
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.get('*/api/coaching/coaches', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const ids = db.coachAthletes
      .filter((c) => c.athleteId === user.id && c.status === 'ACTIVE')
      .map((c) => c.coachId)
    return HttpResponse.json(db.users.filter((u) => ids.includes(u.id)).map(toSessionUser))
  }),

  http.delete<{ coachId: string }>(
    '*/api/coaching/coaches/:coachId',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const relation = findRelation(params.coachId, user.id)
      if (relation?.status !== 'ACTIVE') return problem(404, NO_RELATION)
      relation.status = 'ENDED'
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.get('*/api/coaching/invitations/sent', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
    return HttpResponse.json(pendingInvitations('coach', user.id))
  }),

  http.delete<{ athleteId: string }>(
    '*/api/coaching/invitations/sent/:athleteId',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      const relation = findRelation(user.id, params.athleteId)
      if (relation?.status !== 'PENDING') return problem(404, NO_RELATION)
      db.coachAthletes = db.coachAthletes.filter((c) => c !== relation)
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.get('*/api/coaching/invitations/received', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('ATHLETE')) return problem(403, 'Réservé aux athlètes.')
    return HttpResponse.json(pendingInvitations('athlete', user.id))
  }),

  http.post<{ coachId: string; outcome: string }>(
    '*/api/coaching/invitations/received/:coachId/:outcome',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('ATHLETE')) return problem(403, 'Réservé aux athlètes.')
      if (params.outcome !== 'accept' && params.outcome !== 'decline') {
        return problem(404, 'Route inconnue.')
      }
      const relation = findRelation(params.coachId, user.id)
      if (relation?.status !== 'PENDING') return problem(404, NO_RELATION)
      relation.status = params.outcome === 'accept' ? 'ACTIVE' : 'DECLINED'
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.get<{ athleteId: string }>(
    '*/api/coaching/athletes/:athleteId/overview',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      const athlete = db.users.find((u) => u.id === params.athleteId)
      if (!athlete || !isActiveClient(user.id, athlete.id)) return problem(404, NOT_A_CLIENT)
      return HttpResponse.json(overviewOf(athlete))
    },
  ),

  http.get<{ athleteId: string }>(
    '*/api/coaching/athletes/:athleteId/notes',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      const notes = db.coachNotes
        .filter((n) => n.coachId === user.id && n.athleteId === params.athleteId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(({ coachId: _coachId, ...note }) => note)
      return HttpResponse.json(notePage(notes))
    },
  ),

  http.post<{ athleteId: string }, { content: string }>(
    '*/api/coaching/athletes/:athleteId/notes',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      if (!isActiveClient(user.id, params.athleteId)) return problem(404, NOT_A_CLIENT)
      const body = await request.json()
      const now = new Date().toISOString()
      const note = {
        id: crypto.randomUUID(),
        coachId: user.id,
        athleteId: params.athleteId,
        content: body.content,
        createdAt: now,
        updatedAt: now,
      }
      db.coachNotes.unshift(note)
      const { coachId: _coachId, ...response } = note
      return HttpResponse.json(response, { status: 201 })
    },
  ),

  http.put<{ athleteId: string; noteId: string }, { content: string }>(
    '*/api/coaching/athletes/:athleteId/notes/:noteId',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      if (!isActiveClient(user.id, params.athleteId)) return problem(404, NOT_A_CLIENT)
      const note = db.coachNotes.find(
        (n) => n.id === params.noteId && n.coachId === user.id && n.athleteId === params.athleteId,
      )
      if (!note) return problem(404, 'Note introuvable.')
      const body = await request.json()
      note.content = body.content
      note.updatedAt = new Date().toISOString()
      const { coachId: _coachId, ...response } = note
      return HttpResponse.json(response)
    },
  ),

  http.delete<{ athleteId: string; noteId: string }>(
    '*/api/coaching/athletes/:athleteId/notes/:noteId',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      const note = db.coachNotes.find(
        (n) => n.id === params.noteId && n.coachId === user.id && n.athleteId === params.athleteId,
      )
      if (!note) return problem(404, 'Note introuvable.')
      db.coachNotes = db.coachNotes.filter((n) => n !== note)
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.post<never, CreatePostInput>('*/api/coaching/posts', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
    const body = await request.json()
    const post: CoachPost = {
      id: crypto.randomUUID(),
      coachId: user.id,
      coachName: `${user.firstName} ${user.lastName}`,
      coachAvatarUrl: null,
      content: body.content,
      imageUrl: body.imageUrl
        ? `/api/coaching/posts/images/${body.imageUrl.replace(/^posts\//, '')}`
        : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.posts.unshift(post)
    return HttpResponse.json(post, { status: 201 })
  }),

  http.post('*/api/coaching/posts/images', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
    // Comme le backend : chemin relatif a renvoyer tel quel dans createPost.
    return HttpResponse.json({ imageUrl: `posts/${user.id}/${crypto.randomUUID()}.png` })
  }),

  http.get('*/api/coaching/posts/images/:coachId/:filename', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return new HttpResponse(PLACEHOLDER_PNG, { headers: { 'Content-Type': 'image/png' } })
  }),

  http.get<{ coachId: string }>('*/api/coaching/posts/:coachId', async ({ request, params }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return HttpResponse.json(db.posts.filter((p) => p.coachId === params.coachId))
  }),

  http.delete<{ postId: string }>('*/api/coaching/posts/:postId', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const post = db.posts.find((p) => p.id === params.postId)
    if (!post) return problem(404, 'Publication introuvable.')
    if (post.coachId !== user.id) return problem(403, 'Réservé à l’auteur.')
    db.posts = db.posts.filter((p) => p.id !== params.postId)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/coaching/public-profile', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
    const profile = db.coachPublicProfiles.find((p) => p.coachId === user.id)
    return HttpResponse.json({
      enabled: profile?.enabled ?? false,
      headline: profile?.headline ?? null,
      bio: profile?.bio ?? null,
    })
  }),

  http.put<never, PublicProfileSettingsInput>(
    '*/api/coaching/public-profile',
    async ({ request }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      const body = await request.json()
      const next = {
        coachId: user.id,
        enabled: body.enabled,
        headline: body.headline?.trim() ? body.headline.trim() : null,
        bio: body.bio?.trim() ? body.bio.trim() : null,
      }
      const existing = db.coachPublicProfiles.find((p) => p.coachId === user.id)
      if (existing) Object.assign(existing, next)
      else db.coachPublicProfiles.push(next)
      return HttpResponse.json({ enabled: next.enabled, headline: next.headline, bio: next.bio })
    },
  ),

  http.get('*/api/coaching/public/coaches/:coachId', async ({ params, request }) => {
    await networkDelay()
    const coach = db.users.find((u) => u.id === params.coachId && u.roles.includes('COACH'))
    const profile = db.coachPublicProfiles.find((p) => p.coachId === params.coachId)
    if (!coach || !profile?.enabled) return problem(404, 'Ce profil n’est pas disponible.')
    const body: PublicCoachProfile = {
      id: coach.id,
      firstName: coach.firstName,
      lastName: coach.lastName,
      avatarUrl: coach.avatarUrl ?? null,
      headline: profile.headline,
      bio: profile.bio,
      viewerStatus: viewerStatusOf(coach, userFromRequest(request)),
    }
    return HttpResponse.json(body)
  }),

  http.post(
    '*/api/coaching/public/coaches/:coachId/follow-requests',
    async ({ params, request }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('ATHLETE')) return problem(403, 'Réservé aux athlètes.')
      const coach = db.users.find((u) => u.id === params.coachId && u.roles.includes('COACH'))
      const profile = db.coachPublicProfiles.find((p) => p.coachId === params.coachId)
      if (!coach || !profile?.enabled) return problem(404, 'Ce profil n’est pas disponible.')
      const relation = findRelation(coach.id, user.id)
      if (relation?.status === 'ACTIVE') return problem(409, 'Vous êtes déjà suivi par ce coach.')
      if (relation?.status === 'PENDING') {
        return problem(409, 'Ce coach vous a déjà invité : acceptez son invitation.')
      }
      if (relation?.status === 'REQUESTED')
        return problem(409, 'Votre demande est déjà en attente.')
      const invitedAt = new Date().toISOString()
      if (relation) {
        relation.status = 'REQUESTED'
        relation.invitedAt = invitedAt
      } else {
        db.coachAthletes.push({
          coachId: coach.id,
          athleteId: user.id,
          status: 'REQUESTED',
          invitedAt,
        })
      }
      return HttpResponse.json(toInvitation(coach, user, invitedAt), { status: 201 })
    },
  ),

  http.get('*/api/coaching/follow-requests/received', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
    return HttpResponse.json(requestsOf('coach', user.id))
  }),

  http.post(
    '*/api/coaching/follow-requests/received/:athleteId/:answer',
    async ({ params, request }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
      const relation = findRelation(user.id, String(params.athleteId))
      if (relation?.status !== 'REQUESTED') return problem(404, NO_RELATION)
      relation.status = params.answer === 'accept' ? 'ACTIVE' : 'DECLINED'
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.get('*/api/coaching/follow-requests/sent', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('ATHLETE')) return problem(403, 'Réservé aux athlètes.')
    return HttpResponse.json(requestsOf('athlete', user.id))
  }),

  http.delete('*/api/coaching/follow-requests/sent/:coachId', async ({ params, request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('ATHLETE')) return problem(403, 'Réservé aux athlètes.')
    const relation = findRelation(String(params.coachId), user.id)
    if (relation?.status !== 'REQUESTED') return problem(404, NO_RELATION)
    db.coachAthletes = db.coachAthletes.filter((c) => c !== relation)
    return new HttpResponse(null, { status: 204 })
  }),
]
