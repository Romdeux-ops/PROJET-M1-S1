import { createFileRoute } from '@tanstack/react-router'

import { ProgramPage } from '@/features/program'

export const Route = createFileRoute('/_app/program')({
  component: ProgramPage,
})
