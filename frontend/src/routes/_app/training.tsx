import { createFileRoute } from '@tanstack/react-router'

import { sessionsQuery, TrainingPage } from '@/features/training'

export const Route = createFileRoute('/_app/training')({
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(sessionsQuery())
  },
  component: TrainingPage,
})
