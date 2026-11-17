import { api, unwrap } from '@/lib/api/client'

import type { NotificationPage } from '../schemas'

/**
 * Contrat attendu du module notification (backend) :
 *   GET   /api/notifications?page=&size=      -> NotificationPage (plus recentes d'abord)
 *   GET   /api/notifications/unread-count     -> { count }
 *   PATCH /api/notifications/{id}/read        -> 204 (404 si la notification n'est pas a l'utilisateur)
 *   PATCH /api/notifications/read-all         -> 204
 */
export const notificationApi = {
  list: (page = 0, size = 20) =>
    unwrap(
      api.GET('/api/notifications', { params: { query: { page, size } } }),
    ) as Promise<NotificationPage>,
  unreadCount: async () => {
    const { count } = await unwrap(api.GET('/api/notifications/unread-count'))
    return count ?? 0
  },
  markRead: (id: string) =>
    unwrap(
      api.PATCH('/api/notifications/{notificationId}/read', {
        params: { path: { notificationId: id } },
      }),
    ),
  markAllRead: () => unwrap(api.PATCH('/api/notifications/read-all')),
}
