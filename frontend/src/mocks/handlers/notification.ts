import { http, HttpResponse } from 'msw'

import type { NotificationPage } from '@/features/notification/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

const MAX_PAGE_SIZE = 100

/** Plus recentes d'abord, comme l'index du backend. */
const newestFirst = (a: { createdAt: string; id: string }, b: { createdAt: string; id: string }) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)

export const notificationHandlers = [
  http.get('*/api/notifications', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const url = new URL(request.url)
    const page = Math.max(Number(url.searchParams.get('page') ?? 0), 0)
    const size = Math.min(Math.max(Number(url.searchParams.get('size') ?? 20), 1), MAX_PAGE_SIZE)

    const mine = db.notifications.filter((n) => n.userId === user.id).sort(newestFirst)
    const body: NotificationPage = {
      content: mine.slice(page * size, (page + 1) * size).map(({ userId: _, ...n }) => n),
      page,
      size,
      totalElements: mine.length,
      totalPages: Math.ceil(mine.length / size),
    }
    return HttpResponse.json(body)
  }),

  http.get('*/api/notifications/unread-count', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    return HttpResponse.json({
      count: db.notifications.filter((n) => n.userId === user.id && !n.readAt).length,
    })
  }),

  http.patch('*/api/notifications/read-all', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const now = new Date().toISOString()
    for (const n of db.notifications) {
      if (n.userId === user.id && !n.readAt) n.readAt = now
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.patch<{ id: string }>('*/api/notifications/:id/read', async ({ request, params }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const notification = db.notifications.find((n) => n.id === params.id && n.userId === user.id)
    if (!notification) return problem(404, 'Notification introuvable.')
    notification.readAt ??= new Date().toISOString()
    return new HttpResponse(null, { status: 204 })
  }),
]
