import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { LoginPage } from '@/features/identity'

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_auth/login')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()
  // N'accepte que des chemins internes pour eviter les redirections ouvertes.
  const safeRedirect =
    redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : undefined
  return <LoginPage redirectTo={safeRedirect} />
}
