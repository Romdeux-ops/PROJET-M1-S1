import { createFileRoute } from '@tanstack/react-router'

import { DashboardPage } from '@/features/dashboard'
import { statsOverviewQuery } from '@/features/stats'
import { sessionsQuery } from '@/features/training'

export const Route = createFileRoute('/_app/dashboard')({
  // Lance les requetes des l'intention de navigation, sans bloquer l'affichage.
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(statsOverviewQuery())
    void queryClient.prefetchQuery(sessionsQuery())
  },
  component: DashboardPage,
})
