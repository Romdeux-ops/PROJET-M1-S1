import { createFileRoute } from '@tanstack/react-router'

import { RegisterPage } from '@/features/identity'

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
})
