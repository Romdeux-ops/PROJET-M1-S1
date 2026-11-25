import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { LoginPage } from '@/features/identity'
import { safeRedirect } from '@/features/identity/redirect'

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_auth/login')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()
  return <LoginPage redirectTo={safeRedirect(redirect)} />
}
