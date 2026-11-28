import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { MatchingPage } from '@/features/matching'

export const Route = createFileRoute('/_app/matching')({
  component: MatchingRoute,
})

function MatchingRoute() {
  const navigate = useNavigate()
  return (
    <MatchingPage
      onOpenConversation={(conversation) =>
        void navigate({ to: '/messaging', search: { conversation } })
      }
    />
  )
}
