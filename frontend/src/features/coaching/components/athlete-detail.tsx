import { CalendarCheck, CalendarClock, Dumbbell, Flame, Loader2 } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SessionUser } from '@/lib/auth/session'
import { formatDate, formatShortDate } from '@/lib/format'

import { useAthleteOverview, useEndAthlete } from '../hooks/use-coaching'
import { EndRelationDialog } from './end-relation-dialog'
import { NotesPanel } from './notes-panel'

/** Suivi d'un athlète pour son coach : activité récente, séances à venir, notes privées. */
export function AthleteDetail({ athlete, onEnded }: { athlete: SessionUser; onEnded: () => void }) {
  const { data: overview, isLoading } = useAthleteOverview(athlete.id)
  const endAthlete = useEndAthlete()
  const name = `${athlete.firstName} ${athlete.lastName}`

  return (
    <section className="space-y-4" aria-label={`Suivi de ${name}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{athlete.email}</p>
        </div>
        <EndRelationDialog
          name={name}
          isPending={endAthlete.isPending}
          onConfirm={() => endAthlete.mutateAsync(athlete.id).then(onEnded)}
        />
      </div>

      {isLoading || !overview ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Dumbbell}
              label="Séances sur 30 jours"
              value={overview.sessionsLast30Days}
            />
            <StatCard
              icon={CalendarCheck}
              label="Dernière séance"
              value={overview.lastSessionDate ? formatShortDate(overview.lastSessionDate) : '—'}
            />
            <StatCard
              icon={Flame}
              label="Série en cours"
              value={`${overview.currentStreakDays} j`}
            />
            <StatCard icon={CalendarClock} label="À valider" value={overview.pendingValidations} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prochaines séances planifiées</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.upcomingSessions.length === 0 ? (
                <EmptyState icon={CalendarClock} title="Aucune séance planifiée" />
              ) : (
                <ul className="space-y-2">
                  {overview.upcomingSessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{session.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.scheduledDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <NotesPanel athleteId={athlete.id} />
    </section>
  )
}
