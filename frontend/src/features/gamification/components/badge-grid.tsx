import { Award, Lock } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { Badge } from '../schemas'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => {
        const earned = badge.awardedAt !== null
        return (
          <li
            key={badge.id}
            data-earned={earned}
            className={cn(
              'flex gap-3 rounded-xl border p-4',
              earned ? 'bg-card' : 'bg-muted/40 text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-lg',
                earned ? 'bg-accent text-accent-foreground' : 'bg-muted',
              )}
            >
              {earned ? <Award className="size-5" /> : <Lock className="size-4" />}
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="leading-tight font-medium">{badge.name}</p>
              <p className="text-xs">{badge.description}</p>
              {earned && badge.awardedAt && (
                <p className="text-xs font-medium text-success">
                  Obtenu le {dateFormatter.format(new Date(badge.awardedAt))}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
