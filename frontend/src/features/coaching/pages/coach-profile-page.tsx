import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Hourglass,
  Loader2,
  MailPlus,
  UserCheck,
  UserPlus,
} from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { initials } from '@/lib/utils'

import { PublicProfileCardLink } from '../components/public-profile-card-link'
import { useCancelFollowRequest, usePublicProfile, useRequestFollow } from '../hooks/use-coaching'
import type { PublicCoachProfile } from '../schemas'

/** Page ouverte en scannant le QR code d'un coach : lisible sans compte, avec la demande de suivi pour un athlete. */
export function CoachProfilePage({ coachId }: { coachId: string }) {
  const { data: profile, isLoading, isError } = usePublicProfile(coachId)

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link to="/" aria-label="Accueil FitCoach">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-xl px-4 pb-16">
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-2xl" />
        ) : isError || !profile ? (
          <EmptyState
            icon={UserCheck}
            title="Ce profil n'est pas disponible"
            description="Le coach ne l'a pas rendu public, ou le lien est incorrect."
            action={
              <Button asChild variant="outline">
                <Link to="/">
                  <ArrowLeft /> Retour à l&apos;accueil
                </Link>
              </Button>
            }
          />
        ) : (
          <ProfileCard profile={profile} />
        )}
      </main>
    </div>
  )
}

function ProfileCard({ profile }: { profile: PublicCoachProfile }) {
  const name = `${profile.firstName} ${profile.lastName}`
  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-brand" />
      <CardContent className="space-y-6 pb-8">
        <div className="-mt-14 flex flex-col items-center gap-3 text-center">
          <Avatar className="size-24 border-4 border-card shadow-md">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={name} />}
            <AvatarFallback className="bg-brand text-2xl font-semibold text-white">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            {profile.headline && <p className="mt-1 text-muted-foreground">{profile.headline}</p>}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
            {profile.bio}
          </p>
        )}

        <div className="border-t pt-6">
          <FollowAction profile={profile} />
        </div>
      </CardContent>
    </Card>
  )
}

/** L'action proposee depend de qui regarde le profil. */
function FollowAction({ profile }: { profile: PublicCoachProfile }) {
  const request = useRequestFollow(profile.id)
  const cancel = useCancelFollowRequest()

  switch (profile.viewerStatus) {
    case 'ANONYMOUS':
      return (
        <div className="space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            Connectez-vous avec un compte athlète pour demander à être suivi.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/login" search={{ redirect: `/coach/${profile.id}` }}>
                Se connecter
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Créer un compte</Link>
            </Button>
          </div>
        </div>
      )
    case 'SELF':
      return <PublicProfileCardLink />
    case 'NOT_ATHLETE':
      return (
        <p className="text-center text-sm text-muted-foreground">
          Seuls les athlètes peuvent demander à être suivis par un coach.
        </p>
      )
    case 'NONE':
      return (
        <div className="space-y-2 text-center">
          <Button size="lg" disabled={request.isPending} onClick={() => request.mutate()}>
            {request.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Demander à être suivi
          </Button>
          <p className="text-xs text-muted-foreground">
            Le coach n&apos;aura accès à vos données qu&apos;après avoir accepté.
          </p>
        </div>
      )
    case 'REQUESTED':
      return (
        <div className="space-y-3 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium">
            <Hourglass className="size-4 text-warning" /> Demande envoyée, en attente de la réponse
            du coach.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate(profile.id)}
          >
            Annuler la demande
          </Button>
        </div>
      )
    case 'INVITED':
      return (
        <div className="space-y-3 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium">
            <MailPlus className="size-4 text-primary" /> Ce coach vous a déjà invité.
          </p>
          <Button asChild>
            <Link to="/coaching">Voir l&apos;invitation</Link>
          </Button>
        </div>
      )
    case 'ACTIVE':
      return (
        <div className="space-y-3 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium">
            <CheckCircle2 className="size-4 text-success" /> Vous êtes suivi par ce coach.
          </p>
          <Button asChild variant="outline">
            <Link to="/coaching">Aller à mon espace coaching</Link>
          </Button>
        </div>
      )
  }
}
