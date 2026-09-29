import { createFileRoute } from '@tanstack/react-router'

import { ProfilePage } from '@/features/identity'

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
