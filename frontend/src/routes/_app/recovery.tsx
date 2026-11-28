import { createFileRoute } from '@tanstack/react-router'

import { RecoveryPage } from '@/features/recovery'

export const Route = createFileRoute('/_app/recovery')({
  component: RecoveryPage,
})
