import { createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '@/app/layouts/auth-layout'
import { redirectIfAuthenticated } from '@/lib/auth/guards'

export const Route = createFileRoute('/_auth')({
  beforeLoad: redirectIfAuthenticated,
  component: AuthLayout,
})
