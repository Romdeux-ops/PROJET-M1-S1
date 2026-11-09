import { api, unwrap } from '@/lib/api/client'

import type { Conversation, Message, MessagePage } from '../schemas'

/**
 * Contrat attendu du module messaging (backend) :
 *   GET   /api/messaging/conversations                          -> Conversation[] (les plus actives d'abord)
 *   POST  /api/messaging/conversations                          -> Conversation (201 creee, 200 existante)
 *   GET   /api/messaging/conversations/{id}/messages?before=&size= -> MessagePage (plus recent d'abord)
 *   POST  /api/messaging/conversations/{id}/messages            -> Message (201, relation coach / athlete active)
 *   PATCH /api/messaging/conversations/{id}/read                -> 204 (marque lus les messages recus)
 *
 * `before` est le `nextCursor` de la page precedente ; seuls les participants voient une conversation (404 sinon).
 */
export const messagingApi = {
  listConversations: () =>
    unwrap(api.GET('/api/messaging/conversations')) as Promise<Conversation[]>,
  startConversation: (counterpartId: string) =>
    unwrap(
      api.POST('/api/messaging/conversations', { body: { counterpartId } }),
    ) as Promise<Conversation>,
  listMessages: (conversationId: string, before?: string) =>
    unwrap(
      api.GET('/api/messaging/conversations/{conversationId}/messages', {
        params: { path: { conversationId }, query: { before } },
      }),
    ) as Promise<MessagePage>,
  send: (conversationId: string, body: string) =>
    unwrap(
      api.POST('/api/messaging/conversations/{conversationId}/messages', {
        params: { path: { conversationId } },
        body: { body },
      }),
    ) as Promise<Message>,
  markRead: (conversationId: string) =>
    unwrap(
      api.PATCH('/api/messaging/conversations/{conversationId}/read', {
        params: { path: { conversationId } },
      }),
    ),
}
