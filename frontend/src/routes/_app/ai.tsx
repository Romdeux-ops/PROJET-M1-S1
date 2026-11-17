import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { AiPage } from '@/features/ai'

function AiRoute() {
  const navigate = useNavigate()
  return <AiPage onSaved={() => navigate({ to: '/program' })} />
}

export const Route = createFileRoute('/_app/ai')({
  component: AiRoute,
})
