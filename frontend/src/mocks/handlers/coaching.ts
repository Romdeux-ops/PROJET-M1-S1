import { http, HttpResponse } from 'msw'

import type { AddAthleteInput, CoachPost, CreatePostInput } from '@/features/coaching/schemas'

import { db, toSessionUser, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

export const coachingHandlers = [
  http.post<never, AddAthleteInput>('*/api/coaching/athletes', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    if (!user.roles.includes('COACH')) return problem(403, 'Réservé aux coachs.')
    const body = await request.json()
    const athlete = db.users.find((u) => u.email.toLowerCase() === body.athleteEmail.toLowerCase())
    if (!athlete) return problem(404, 'Aucun athlète avec cet e-mail.')
    db.coachAthletes.push({ coachId: user.id, athleteId: athlete.id, status: 'ACTIVE' })
    return HttpResponse.json(toSessionUser(athlete), { status: 201 })
  }),

  http.get('*/api/coaching/athletes', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const ids = db.coachAthletes.filter((c) => c.coachId === user.id && c.status === 'ACTIVE').map((c) => c.athleteId)
    return HttpResponse.json(db.users.filter((u) => ids.includes(u.id)).map(toSessionUser))
  }),

  http.get('*/api/coaching/coaches', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const ids = db.coachAthletes.filter((c) => c.athleteId === user.id && c.status === 'ACTIVE').map((c) => c.coachId)
    return HttpResponse.json(db.users.filter((u) => ids.includes(u.id)).map(toSessionUser))
  }),

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
      imageUrl: body.imageUrl ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.posts.unshift(post)
    return HttpResponse.json(post, { status: 201 })
  }),

  http.post('*/api/coaching/posts/images', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return HttpResponse.json({ imageUrl: '/uploads/posts/mock-image.jpg' }, { status: 201 })
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
]
