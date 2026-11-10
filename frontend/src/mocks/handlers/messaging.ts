import { http, HttpResponse } from 'msw'

import type { Conversation, Message, MessagePage } from '@/features/messaging/schemas'

import { db, type MockConversation, type MockUser, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

const DEFAULT_PAGE_SIZE = 30
const MAX_PAGE_SIZE = 100
const PREVIEW_LENGTH = 120
const NOT_ACTIVE =
  "La messagerie n'est ouverte qu'entre un coach et un athlète qu'il suit activement."

function isActiveClient(coachId: string, athleteId: string) {
  return db.coachAthletes.some(
    (c) => c.coachId === coachId && c.athleteId === athleteId && c.status === 'ACTIVE',
  )
}

/** Plus recent d'abord, `id` pour departager, comme l'index du backend. */
const newestFirst = (a: Message, b: Message) =>
  b.sentAt.localeCompare(a.sentAt) || b.id.localeCompare(a.id)

function messagesOf(conversationId: string) {
  return db.messages.filter((m) => m.conversationId === conversationId).sort(newestFirst)
}

function participantConversation(id: string, user: MockUser) {
  return db.conversations.find(
    (c) => c.id === id && (c.coachId === user.id || c.athleteId === user.id),
  )
}

function toView(conversation: MockConversation, viewerId: string): Conversation {
  const counterpartId =
    conversation.coachId === viewerId ? conversation.athleteId : conversation.coachId
  const counterpart = db.users.find((u) => u.id === counterpartId)
  const messages = messagesOf(conversation.id)
  const last = messages[0]
  return {
    id: conversation.id,
    counterpartId,
    counterpartName: counterpart ? `${counterpart.firstName} ${counterpart.lastName}` : '',
    lastMessagePreview: last
      ? last.body.length <= PREVIEW_LENGTH
        ? last.body
        : `${last.body.slice(0, PREVIEW_LENGTH - 1)}…`
      : null,
    lastMessageSenderId: last?.senderId ?? null,
    lastMessageAt: last?.sentAt ?? null,
    unreadCount: messages.filter((m) => m.senderId !== viewerId && m.readAt === null).length,
  }
}

/** Comme le backend : lastMessageAt DESC NULLS LAST, createdAt DESC. */
function compareConversations(
  a: { raw: MockConversation; view: Conversation },
  b: { raw: MockConversation; view: Conversation },
) {
  const aAt = a.view.lastMessageAt
  const bAt = b.view.lastMessageAt
  if (aAt && bAt) {
    const byLast = bAt.localeCompare(aAt)
    if (byLast !== 0) return byLast
  } else if (aAt) {
    return -1
  } else if (bAt) {
    return 1
  }
  return b.raw.createdAt.localeCompare(a.raw.createdAt)
}

export const messagingHandlers = [
  http.get('*/api/messaging/conversations', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    return HttpResponse.json(
      db.conversations
        .filter((c) => c.coachId === user.id || c.athleteId === user.id)
        .map((c) => ({ raw: c, view: toView(c, user.id) }))
        .sort(compareConversations)
        .map((c) => c.view),
    )
  }),

  http.post<never, { counterpartId: string }>(
    '*/api/messaging/conversations',
    async ({ request }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const { counterpartId } = await request.json()
      const pair = isActiveClient(user.id, counterpartId)
        ? { coachId: user.id, athleteId: counterpartId }
        : isActiveClient(counterpartId, user.id)
          ? { coachId: counterpartId, athleteId: user.id }
          : null
      if (!pair) return problem(403, NOT_ACTIVE)

      const existing = db.conversations.find(
        (c) => c.coachId === pair.coachId && c.athleteId === pair.athleteId,
      )
      if (existing) return HttpResponse.json(toView(existing, user.id))
      const conversation: MockConversation = {
        id: crypto.randomUUID(),
        ...pair,
        createdAt: new Date().toISOString(),
      }
      db.conversations.push(conversation)
      return HttpResponse.json(toView(conversation, user.id), { status: 201 })
    },
  ),

  http.get<{ id: string }>(
    '*/api/messaging/conversations/:id/messages',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!participantConversation(params.id, user))
        return problem(404, 'Conversation introuvable.')
      const url = new URL(request.url)
      const size = Number(url.searchParams.get('size') ?? DEFAULT_PAGE_SIZE)
      if (!Number.isInteger(size) || size < 1 || size > MAX_PAGE_SIZE) {
        return problem(400, `La taille de page doit être comprise entre 1 et ${MAX_PAGE_SIZE}.`)
      }

      const messages = messagesOf(params.id)
      const before = url.searchParams.get('before')
      let start = 0
      if (before) {
        const index = messages.findIndex((m) => m.id === before)
        if (index === -1) return problem(400, 'Curseur de pagination invalide.')
        start = index + 1
      }
      const items = messages.slice(start, start + size)
      const hasMore = messages.length > start + size
      const page: MessagePage = { items, nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null }
      return HttpResponse.json(page)
    },
  ),

  http.post<{ id: string }, { body: string }>(
    '*/api/messaging/conversations/:id/messages',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const conversation = participantConversation(params.id, user)
      if (!conversation) return problem(404, 'Conversation introuvable.')
      if (!isActiveClient(conversation.coachId, conversation.athleteId)) {
        return problem(403, NOT_ACTIVE)
      }
      const body = (await request.json()).body.trim()
      if (!body || body.length > 2000) return problem(400, 'Certaines données sont invalides.')
      const message: Message = {
        id: crypto.randomUUID(),
        conversationId: conversation.id,
        senderId: user.id,
        body,
        sentAt: new Date().toISOString(),
        readAt: null,
      }
      db.messages.push(message)
      return HttpResponse.json(message, { status: 201 })
    },
  ),

  http.patch<{ id: string }>(
    '*/api/messaging/conversations/:id/read',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      if (!participantConversation(params.id, user))
        return problem(404, 'Conversation introuvable.')
      const now = new Date().toISOString()
      for (const message of db.messages) {
        if (
          message.conversationId === params.id &&
          message.senderId !== user.id &&
          !message.readAt
        ) {
          message.readAt = now
        }
      }
      return new HttpResponse(null, { status: 204 })
    },
  ),
]
