import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { MessagingPage } from '@/features/messaging'

const searchSchema = z.object({
  /** Conversation a ouvrir d'emblee, par exemple apres un match FitMatch. */
  conversation: z.string().optional(),
})

export const Route = createFileRoute('/_app/messaging')({
  validateSearch: searchSchema,
  component: MessagingRoute,
})

function MessagingRoute() {
  const { conversation } = Route.useSearch()
  return <MessagingPage key={conversation} initialConversationId={conversation} />
}
