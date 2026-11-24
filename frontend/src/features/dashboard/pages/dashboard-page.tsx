import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarCheck, Clock, Flame, Gauge, Plus } from 'lucide-react'
import { useState } from 'react'

import { ErrorState } from '@/components/feedback'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { StatCard, StatCardSkeleton } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NAV_ITEMS } from '@/features/navigation'
import { useStatsOverview, WeeklyActivityChart } from '@/features/stats'
import { useSessions } from '@/features/training'
import { useSession } from '@/lib/auth/session'
import { formatDuration, formatShortDate } from '@/lib/format'

function greeting(now: Date) {
  const hour = now.getHours()
  if (hour < 5 || hour >= 18) return 'Bonsoir'
  return 'Bonjour'
}

const QUICK_LINKS = ['program', 'planning', 'booking', 'ai'] as const

export function DashboardPage() {
  const [now] = useState(() => new Date())
  const user = useSession((s) => s.user)
  const stats = useStatsOverview()
  const sessions = useSessions()
  const recent = sessions.data?.slice(0, 5)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white shadow-lg shadow-primary/20 sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 animate-float rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 size-60 animate-float-slow rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/80">{formatShortDate(now)}</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting(now)}, {user?.firstName} !
            </h1>
            <p className="max-w-md text-white/85">
              {stats.data
                ? `${stats.data.sessionsThisWeek} séance${stats.data.sessionsThisWeek > 1 ? 's' : ''} cette semaine. Continuez sur cette lancée.`
                : 'Prêt pour votre prochaine séance ?'}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-foreground hover:bg-white/90"
          >
            <Link to="/training">
              <Plus /> Enregistrer une séance
            </Link>
          </Button>
        </div>
      </section>

      {stats.isError ? (
        <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
      ) : (
        <Stagger as="section" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.data ? (
            <>
              <StaggerItem>
                <StatCard
                  label="Séances"
                  value={stats.data.sessionsThisWeek}
                  icon={CalendarCheck}
                  trend={stats.data.sessionsTrend}
                  hint="vs semaine dernière"
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  label="Temps d'entraînement"
                  value={formatDuration(stats.data.minutesThisWeek)}
                  icon={Clock}
                  trend={stats.data.minutesTrend}
                  hint="vs semaine dernière"
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  label="Série en cours"
                  value={`${stats.data.currentStreakDays} j`}
                  icon={Flame}
                  hint="jours consécutifs actifs"
                />
              </StaggerItem>
              <StaggerItem>
                <StatCard
                  label="Effort moyen"
                  value={`${stats.data.averageEffort.toFixed(1)}/10`}
                  icon={Gauge}
                  hint="sur la semaine"
                />
              </StaggerItem>
            </>
          ) : (
            Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
          )}
        </Stagger>
      )}

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Activité de la semaine</CardTitle>
            <CardDescription>Minutes d'entraînement sur les 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.data ? (
              <WeeklyActivityChart data={stats.data.weeklyActivity} />
            ) : (
              <Skeleton className="h-44 w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dernières séances</CardTitle>
            <CardDescription>Votre historique récent</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to="/training">
                  Tout voir <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {sessions.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recent && recent.length > 0 ? (
              <Stagger as="ul" className="-mx-2 divide-y">
                {recent.map((s) => (
                  <StaggerItem
                    as="li"
                    key={s.id}
                    className="flex items-center justify-between gap-3 px-2 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(s.performedAt)}
                        {s.durationMinutes != null ? ` · ${formatDuration(s.durationMinutes)}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.sets.length} série(s)</span>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucune séance enregistrée.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Accès rapide</h2>
        <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_LINKS.map((key) => {
            const item = NAV_ITEMS.find((i) => i.key === key)
            if (!item) return null
            const Icon = item.icon
            return (
              <StaggerItem key={key}>
                <Link
                  to={item.to}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>
      </section>
    </div>
  )
}
