import { createFileRoute } from '@tanstack/react-router'

import { MessagingPage } from '@/features/messaging'

export const Route = createFileRoute('/_app/messaging')({
  component: MessagingPage,
})
