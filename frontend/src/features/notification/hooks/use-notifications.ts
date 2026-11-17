import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { notificationApi } from '../api/notification-api'

/** Le compteur de non-lus est la seule requete permanente : la liste ne se charge qu'a l'ouverture du panneau. */
export const UNREAD_POLL_MS = 30_000

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationApi.unreadCount,
    refetchInterval: UNREAD_POLL_MS,
  })
}

export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationApi.list(),
    enabled,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    // Un echec laisse simplement la notification non lue : pas de toast.
    meta: { silentError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
