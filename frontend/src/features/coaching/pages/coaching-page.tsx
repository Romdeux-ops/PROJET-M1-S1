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

import { AddAthleteForm } from '../components/add-athlete-form'
import { PostList } from '../components/post-list'
import { useMyAthletes, useMyCoaches } from '../hooks/use-coaching'

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
  return (
    <div className="space-y-6">
      <PendingValidationsPanel />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Rattacher un athlète</CardTitle>
            <CardDescription>Par son adresse e-mail.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddAthleteForm />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mes athlètes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : !athletes || athletes.length === 0 ? (
              <EmptyState icon={Users} title="Aucun athlète pour le moment" />
            ) : (
              <ul className="space-y-3">
                {athletes.map((athlete) => {
                  const name = `${athlete.firstName} ${athlete.lastName}`
                  return (
                    <li key={athlete.id} className="flex items-center gap-3">
                      <Avatar>
                        {athlete.avatarUrl && <AvatarImage src={athlete.avatarUrl} alt={name} />}
                        <AvatarFallback className="bg-brand text-xs font-semibold text-white">
                          {initials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{athlete.email}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AthleteView() {
  const { data: coaches, isLoading } = useMyCoaches()
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null)

  if (isLoading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  }

  if (!coaches || coaches.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucun coach pour le moment"
        description="Votre coach doit vous rattacher depuis son propre espace coaching."
      />
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Mes coachs</CardTitle>
        </CardHeader>
        <CardContent>
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
  )
}
