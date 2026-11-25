import { createFileRoute } from '@tanstack/react-router'

import { CoachProfilePage } from '@/features/coaching'

/** Route publique : la cible du QR code d'un coach, accessible sans compte. */
export const Route = createFileRoute('/coach/$coachId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { coachId } = Route.useParams()
  return <CoachProfilePage coachId={coachId} />
}
