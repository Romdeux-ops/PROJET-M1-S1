import { Check, Loader2, UserPlus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'

import {
  useAcceptFollowRequest,
  useDeclineFollowRequest,
  useReceivedFollowRequests,
} from '../hooks/use-coaching'

/** Demandes de suivi recues depuis le profil public : tant que le coach ne repond pas, l'athlete n'a aucun acces. */
export function ReceivedFollowRequestsPanel() {
  const { data: requests = [], isLoading } = useReceivedFollowRequests()
  const accept = useAcceptFollowRequest()
  const decline = useDeclineFollowRequest()

  if (isLoading || requests.length === 0) return null

  const busy = accept.isPending || decline.isPending

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="size-4" /> Demandes de suivi
        </CardTitle>
        <CardDescription>
          Ces athlètes ont demandé à être suivis depuis votre profil public. Accepter leur donne la
          messagerie et la réservation de créneaux, et vous donne accès à leur planning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {requests.map((request) => (
            <li
              key={request.athlete.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {request.athlete.firstName} {request.athlete.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {request.athlete.email} · demandée le {formatDate(request.invitedAt)}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={() => accept.mutate(request.athlete.id)}
                >
                  {accept.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  Accepter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => decline.mutate(request.athlete.id)}
                >
                  <X className="size-3.5" /> Refuser
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
