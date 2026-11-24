import { createFileRoute, redirect } from '@tanstack/react-router'

import { LandingPage } from '@/features/landing'
import { isAuthenticated } from '@/lib/auth/session'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (isAuthenticated()) throw redirect({ to: '/dashboard' })
  },
  component: LandingPage,
})
