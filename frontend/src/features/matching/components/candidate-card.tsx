import type { ReactNode } from 'react'
import { CalendarClock, Euro, MapPin, Ruler, Sparkles, Star, Target, Video } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useProfile } from '@/features/identity'
import { formatHeight } from '@/lib/format'
import { cn, initials } from '@/lib/utils'

import {
  type Candidate,
  GOAL_LABELS,
  LEVEL_LABELS,
  REASON_LABELS,
  SLOT_LABELS,
  SPORT_LABELS,
  TRAINING_MODE_LABELS,
} from '../schemas'

/** Contenu d'une carte du fil ; le glisser et l'animation sont geres par `SwipeDeck`. */
export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const isCoach = candidate.side === 'COACH'
  // La taille est stockee en cm ; l'affichage suit la preference d'unites du compte.
  const { data: account } = useProfile()

  return (
    <article
      aria-label={`${candidate.firstName}${candidate.age ? `, ${candidate.age} ans` : ''}`}
      className="flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-xl select-none"
    >
      <div className="relative flex h-44 shrink-0 items-end bg-brand p-5">
        <Avatar className="size-24 border-4 border-card shadow-lg">
          {candidate.avatarUrl && (
            <AvatarImage src={candidate.avatarUrl} alt="" draggable={false} />
          )}
          <AvatarFallback className="bg-card text-2xl font-semibold text-foreground">
            {initials(candidate.firstName)}
          </AvatarFallback>
        </Avatar>
        <ScoreRing score={candidate.score} />
        <Badge className="absolute top-4 left-4 bg-background/80 text-foreground backdrop-blur">
          {isCoach ? 'Coach' : 'Athlète'}
        </Badge>
        {candidate.superLikedYou && (
          <Badge className="absolute top-12 left-4 bg-primary text-primary-foreground">
            <Star className="fill-current" /> Vous a super-liké
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div>
          <h2 className="text-2xl font-semibold">
            {candidate.firstName}
            {candidate.age !== null && (
              <span className="font-normal text-muted-foreground">, {candidate.age}</span>
            )}
          </h2>
          <p className="mt-1 text-sm text-foreground/90">{candidate.headline}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {candidate.sports.map((sport) => (
            <Badge key={sport} variant="secondary">
              {SPORT_LABELS[sport] ?? sport}
            </Badge>
          ))}
        </div>

        {candidate.reasons.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Points communs">
            {candidate.reasons.map((reason) => (
              <li key={reason}>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  <Sparkles /> {REASON_LABELS[reason] ?? reason}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <Detail icon={Target} label={isCoach ? 'Accompagne' : 'Objectif'}>
            {candidate.goals.length > 0
              ? candidate.goals.map((g) => GOAL_LABELS[g] ?? g).join(', ')
              : 'Tous objectifs'}
            {' · '}
            {candidate.levels.length > 0
              ? candidate.levels.map((l) => LEVEL_LABELS[l] ?? l).join(', ')
              : 'tous niveaux'}
          </Detail>
          <Detail icon={CalendarClock} label="Créneaux">
            {candidate.availability.map((s) => SLOT_LABELS[s] ?? s).join(', ')}
          </Detail>
          <Detail icon={candidate.trainingMode === 'REMOTE' ? Video : MapPin} label="Format">
            {TRAINING_MODE_LABELS[candidate.trainingMode]}
            {candidate.city && ` · ${candidate.city}`}
          </Detail>
          {candidate.sessionRateEur !== null && (
            <Detail icon={Euro} label="Tarif">
              {candidate.sessionRateEur} € / séance
            </Detail>
          )}
          {candidate.heightCm !== null && (
            <Detail icon={Ruler} label="Taille">
              {formatHeight(candidate.heightCm, account?.unitSystem)}
            </Detail>
          )}
        </dl>

        {candidate.about && (
          <p className="text-sm whitespace-pre-line text-muted-foreground">{candidate.about}</p>
        )}
      </div>
    </article>
  )
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Target
  label: string
  children: ReactNode
}) {
  // <dl> n'accepte que des <div> qui regroupent directement <dt> et <dd>.
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>{children}</span>
      </dd>
    </div>
  )
}

/** Compatibilite sportive, de 0 a 100. */
function ScoreRing({ score }: { score: number }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  return (
    <div
      className="absolute right-4 bottom-4 grid size-16 place-items-center rounded-full bg-card shadow-lg"
      role="img"
      aria-label={`Compatibilité ${score} %`}
    >
      <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
        <circle cx="28" cy="28" r={radius} className="fill-none stroke-muted" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          className={cn(
            'fill-none',
            score >= 75 ? 'stroke-success' : score >= 50 ? 'stroke-warning' : 'stroke-destructive',
          )}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
        />
      </svg>
      <span className="relative text-sm font-bold">{score}%</span>
    </div>
  )
}
