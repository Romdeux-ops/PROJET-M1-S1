import { Hourglass, Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'

import { useCancelFollowRequest, useSentFollowRequests } from '../hooks/use-coaching'

/** Demandes de suivi envoyees par l'athlete et pas encore repondues : il peut les retirer. */
export function SentFollowRequestsPanel() {
  const { data: requests = [], isLoading } = useSentFollowRequests()
  const cancel = useCancelFollowRequest()

  if (isLoading || requests.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Hourglass className="size-4" /> Mes demandes de suivi
        </CardTitle>
        <CardDescription>En attente de la réponse du coach.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {requests.map((request) => (
            <li
              key={request.coach.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {request.coach.firstName} {request.coach.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Envoyée le {formatDate(request.invitedAt)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate(request.coach.id)}
              >
                {cancel.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <X className="size-3.5" />
                )}
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
