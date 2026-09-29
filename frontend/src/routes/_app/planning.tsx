import { createFileRoute } from '@tanstack/react-router'

import { PlanningPage } from '@/features/planning'

export const Route = createFileRoute('/_app/planning')({
  component: PlanningPage,
})
