import { Loader2, MailCheck, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'

import { useCancelInvitation, useSentInvitations } from '../hooks/use-coaching'

/** Invitations envoyees par le coach, en attente de la reponse de l'athlete. */
export function SentInvitationsPanel() {
  const { data: invitations = [], isLoading } = useSentInvitations()
  const cancel = useCancelInvitation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MailCheck className="size-4" /> Invitations en attente
        </CardTitle>
        <CardDescription>L'athlète doit accepter pour que le suivi commence.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune invitation en attente.</p>
        ) : (
          <ul className="space-y-2">
            {invitations.map((invitation) => (
              <li
                key={invitation.athlete.id}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {invitation.athlete.firstName} {invitation.athlete.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {invitation.athlete.email} · envoyée le {formatDate(invitation.invitedAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(invitation.athlete.id)}
                >
                  <X className="size-3.5" /> Annuler
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
