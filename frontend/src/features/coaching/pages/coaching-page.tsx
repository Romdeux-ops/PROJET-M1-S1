import { Loader2, Users } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useHasRole } from '@/lib/auth/session'
import { initials } from '@/lib/utils'

import { PendingValidationsPanel } from '@/features/planning'

import { AthleteDetail } from '../components/athlete-detail'
import { EndRelationDialog } from '../components/end-relation-dialog'
import { InviteAthleteForm } from '../components/invite-athlete-form'
import { PostList } from '../components/post-list'
import { PublicProfileCard } from '../components/public-profile-card'
import { ReceivedFollowRequestsPanel } from '../components/received-follow-requests-panel'
import { ReceivedInvitationsPanel } from '../components/received-invitations-panel'
import { SentFollowRequestsPanel } from '../components/sent-follow-requests-panel'
import { SentInvitationsPanel } from '../components/sent-invitations-panel'
import { useEndCoach, useMyAthletes, useMyCoaches } from '../hooks/use-coaching'

export function CoachingPage() {
  const isCoach = useHasRole('COACH')
  return (
    <>
      <PageHeader
        title="Coaching"
        description={isCoach ? 'Vos athlètes suivis.' : 'Vos coachs et leurs publications.'}
      />
      {isCoach ? <CoachView /> : <AthleteView />}
    </>
  )
}

function CoachView() {
  const { data: athletes, isLoading } = useMyAthletes()
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null)
  const selectedAthlete = athletes?.find((athlete) => athlete.id === selectedAthleteId)

  return (
    <div className="space-y-6">
      <PendingValidationsPanel />
      <ReceivedFollowRequestsPanel />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Inviter un athlète</CardTitle>
              <CardDescription>
                Par son adresse e-mail. Le suivi commence quand il accepte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteAthleteForm />
            </CardContent>
          </Card>
          <SentInvitationsPanel />
          <PublicProfileCard />
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mes athlètes</CardTitle>
            <CardDescription>Sélectionnez un athlète pour ouvrir son suivi.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : !athletes || athletes.length === 0 ? (
              <EmptyState icon={Users} title="Aucun athlète pour le moment" />
            ) : (
              <ul className="space-y-2">
                {athletes.map((athlete) => {
                  const name = `${athlete.firstName} ${athlete.lastName}`
                  return (
                    <li key={athlete.id}>
                      <Button
                        type="button"
                        variant={athlete.id === selectedAthleteId ? 'secondary' : 'ghost'}
                        className="h-auto w-full justify-start gap-3 py-2"
                        onClick={() => setSelectedAthleteId(athlete.id)}
                      >
                        <Avatar>
                          {athlete.avatarUrl && <AvatarImage src={athlete.avatarUrl} alt={name} />}
                          <AvatarFallback className="bg-brand text-xs font-semibold text-white">
                            {initials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-left">
                          <span className="block text-sm font-medium">{name}</span>
                          <span className="block text-xs font-normal text-muted-foreground">
                            {athlete.email}
                          </span>
                        </span>
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedAthlete && (
        <AthleteDetail
          key={selectedAthlete.id}
          athlete={selectedAthlete}
          onEnded={() => setSelectedAthleteId(null)}
        />
      )}
    </div>
  )
}

function AthleteView() {
  const { data: coaches, isLoading } = useMyCoaches()
  const endCoach = useEndCoach()
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null)
  const selectedCoach = coaches?.find((coach) => coach.id === selectedCoachId)

  if (isLoading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      <ReceivedInvitationsPanel />
      <SentFollowRequestsPanel />
      {!coaches || coaches.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun coach pour le moment"
          description="Votre coach peut vous inviter depuis son espace coaching, ou vous pouvez scanner son QR code pour demander à être suivi."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Mes coachs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {coaches.map((coach) => {
                  const name = `${coach.firstName} ${coach.lastName}`
                  const selected = coach.id === selectedCoachId
                  return (
                    <li key={coach.id}>
                      <Button
                        type="button"
                        variant={selected ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                        onClick={() => setSelectedCoachId(coach.id)}
                      >
                        <Avatar size="sm">
                          {coach.avatarUrl && <AvatarImage src={coach.avatarUrl} alt={name} />}
                          <AvatarFallback className="bg-brand text-xs font-semibold text-white">
                            {initials(name)}
                          </AvatarFallback>
                        </Avatar>
                        {name}
                      </Button>
                    </li>
                  )
                })}
              </ul>
              {selectedCoach && (
                <EndRelationDialog
                  name={`${selectedCoach.firstName} ${selectedCoach.lastName}`}
                  isPending={endCoach.isPending}
                  onConfirm={() =>
                    endCoach.mutateAsync(selectedCoach.id).then(() => setSelectedCoachId(null))
                  }
                />
              )}
            </CardContent>
          </Card>
          <div className="lg:col-span-2">
            {selectedCoachId ? (
              <PostList coachId={selectedCoachId} />
            ) : (
              <EmptyState icon={Users} title="Sélectionnez un coach pour voir ses publications" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
