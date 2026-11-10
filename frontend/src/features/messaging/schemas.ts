import { z } from 'zod'

export const MESSAGE_MAX_LENGTH = 2000

/** Conversation vue par l'utilisateur connecte ; `last*` sont nuls tant qu'aucun message n'a ete envoye. */
export interface Conversation {
  id: string
  counterpartId: string
  counterpartName: string
  lastMessagePreview: string | null
  lastMessageSenderId: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  sentAt: string
  /** Pose quand le destinataire ouvre la conversation. */
  readAt: string | null
}

/** Page d'historique, plus recent d'abord ; `nextCursor` est nul en fin d'historique. */
export interface MessagePage {
  items: Message[]
  nextCursor: string | null
}

export const messageFormSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Le message est vide')
    .max(MESSAGE_MAX_LENGTH, `${MESSAGE_MAX_LENGTH} caractères maximum`),
})
export type MessageFormInput = z.infer<typeof messageFormSchema>
