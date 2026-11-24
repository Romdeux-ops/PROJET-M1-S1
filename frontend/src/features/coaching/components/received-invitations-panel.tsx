import { Check, Loader2, MailPlus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'

import {
  useAcceptInvitation,
  useDeclineInvitation,
  useReceivedInvitations,
} from '../hooks/use-coaching'

/** Invitations de coachs reçues par l'athlète : tant qu'il ne répond pas, le coach n'a accès à rien. */
export function ReceivedInvitationsPanel() {
  const { data: invitations = [], isLoading } = useReceivedInvitations()
  const accept = useAcceptInvitation()
  const decline = useDeclineInvitation()

  if (isLoading || invitations.length === 0) return null

  const busy = accept.isPending || decline.isPending

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MailPlus className="size-4" /> Invitations de coachs
        </CardTitle>
        <CardDescription>
          Accepter donne à ce coach accès à vos séances planifiées et à la messagerie.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {invitations.map((invitation) => (
            <li
              key={invitation.coach.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {invitation.coach.firstName} {invitation.coach.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {invitation.coach.email} · reçue le {formatDate(invitation.invitedAt)}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={() => accept.mutate(invitation.coach.id)}
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
                  onClick={() => decline.mutate(invitation.coach.id)}
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
