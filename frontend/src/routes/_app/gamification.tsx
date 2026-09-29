import { createFileRoute } from '@tanstack/react-router'

import { GamificationPage } from '@/features/gamification'

export const Route = createFileRoute('/_app/gamification')({
  component: GamificationPage,
})
