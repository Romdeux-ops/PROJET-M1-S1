import { createFileRoute } from '@tanstack/react-router'

import { AdminPage } from '@/features/admin'
import { requireRole } from '@/lib/auth/guards'

export const Route = createFileRoute('/_app/admin')({
  beforeLoad: requireRole('ADMIN'),
  component: AdminPage,
})
