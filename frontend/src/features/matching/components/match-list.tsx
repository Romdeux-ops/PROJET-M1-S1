import { HeartOff, Loader2, MessageCircle } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { initials } from '@/lib/utils'

import { useMatches, useUnmatch } from '../hooks/use-matching'
import { type Match, SPORT_LABELS } from '../schemas'
import { HeartDumbbell } from '@/components/heart-dumbbell-icon'

interface MatchListProps {
  onMessage: (match: Match) => void
  messagingId?: string | null
}

export function MatchList({ onMessage, messagingId }: MatchListProps) {
  const { data: matches, isLoading } = useMatches()
  const unmatch = useUnmatch()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!matches?.length) {
    return (
      <EmptyState
        icon={HeartDumbbell}
        title="Pas encore de match"
        description="Likez des profils dans « Découvrir » : dès que l'intérêt est réciproque, le match apparaît ici et la messagerie s'ouvre."
      />
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <li key={match.id}>
          <Card className="h-full">
            <CardContent className="flex h-full flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  {match.counterpartAvatarUrl && (
                    <AvatarImage src={match.counterpartAvatarUrl} alt="" />
                  )}
                  <AvatarFallback className="bg-brand font-semibold text-white">
                    {initials(match.counterpartFirstName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold">
                    {match.counterpartFirstName}
                    {match.counterpartAge !== null && (
                      <span className="font-normal text-muted-foreground">
                        , {match.counterpartAge}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {match.counterpartHeadline ??
                      (match.counterpartSide === 'COACH' ? 'Coach' : 'Athlète')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">
                  {match.counterpartSide === 'COACH' ? 'Coach' : 'Athlète'}
                </Badge>
                {match.counterpartSports.slice(0, 3).map((sport) => (
                  <Badge key={sport} variant="secondary">
                    {SPORT_LABELS[sport] ?? sport}
                  </Badge>
                ))}
              </div>
              <div className="mt-auto flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => onMessage(match)}
                  disabled={messagingId === match.id}
                  aria-label={`Écrire à ${match.counterpartFirstName}`}
                >
                  {messagingId === match.id ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <MessageCircle />
                  )}
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Retirer le match avec ${match.counterpartFirstName}`}
                  disabled={unmatch.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Retirer le match avec ${match.counterpartFirstName} ? Vous ne pourrez plus lui écrire.`,
                      )
                    ) {
                      unmatch.mutate(match.id)
                    }
                  }}
                >
                  <HeartOff />
                </Button>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
