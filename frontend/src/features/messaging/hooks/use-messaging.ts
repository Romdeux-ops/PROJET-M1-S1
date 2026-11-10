import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { messagingApi } from '../api/messaging-api'

/**
 * Le temps reel passe pour l'instant par du polling : ces intervalles sont le
 * seul point a modifier le jour ou un canal WebSocket notifiera les nouveautes.
 */
export const CONVERSATIONS_POLL_MS = 15_000
export const MESSAGES_POLL_MS = 5_000

export const messagingKeys = {
  all: ['messaging'] as const,
  conversations: () => [...messagingKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...messagingKeys.all, 'messages', conversationId] as const,
}

export function useConversations() {
  return useQuery({
    queryKey: messagingKeys.conversations(),
    queryFn: messagingApi.listConversations,
    refetchInterval: CONVERSATIONS_POLL_MS,
  })
}

/** Historique pagine : chaque page est plus ancienne que la precedente. */
export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: messagingKeys.messages(conversationId),
    queryFn: ({ pageParam }) => messagingApi.listMessages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: MESSAGES_POLL_MS,
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (counterpartId: string) => messagingApi.startConversation(counterpartId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() }),
  })
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => messagingApi.send(conversationId, body),
    meta: { silentError: true },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: messagingKeys.messages(conversationId) }),
        queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() }),
      ]),
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messagingApi.markRead(conversationId),
    // Un accuse de lecture perdu sera renvoye au prochain message recu : pas de toast.
    meta: { silentError: true },
    onSuccess: (_, conversationId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() }),
        queryClient.invalidateQueries({ queryKey: messagingKeys.messages(conversationId) }),
      ]),
  })
}
