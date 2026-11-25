import { Ban, CalendarClock, CheckCircle2, Hourglass, type LucideIcon } from 'lucide-react'

import { AnimatedNumber } from '@/components/motion/animated-number'
import { Progress } from '@/components/ui/progress'

import type { ScheduledSession, ScheduledStatus } from '../schemas'

const ITEMS: { status: ScheduledStatus; label: string; icon: LucideIcon; tone: string }[] = [
  { status: 'PLANNED', label: 'À faire', icon: CalendarClock, tone: 'text-primary bg-primary/10' },
  {
    status: 'PENDING_VALIDATION',
    label: 'À valider',
    icon: Hourglass,
    tone: 'text-warning bg-warning/15',
  },
  { status: 'DONE', label: 'Réalisées', icon: CheckCircle2, tone: 'text-success bg-success/15' },
  { status: 'SKIPPED', label: 'Sautées', icon: Ban, tone: 'text-muted-foreground bg-muted' },
]

/** Bilan de la semaine : une pastille par statut et la progression des seances realisees. */
export function WeekSummary({ sessions }: { sessions: ScheduledSession[] }) {
  const count = (status: ScheduledStatus) => sessions.filter((s) => s.status === status).length
  const counted = sessions.length - count('SKIPPED')
  const done = count('DONE')
  const percent = counted > 0 ? Math.round((done / counted) * 100) : 0

  return (
    <section aria-label="Bilan de la semaine" className="space-y-4 rounded-2xl border bg-card p-5">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ITEMS.map(({ status, label, icon: Icon, tone }) => (
          <li key={status} className="flex items-center gap-3">
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block text-2xl leading-none font-bold tabular-nums">
                <AnimatedNumber value={String(count(status))} />
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </span>
          </li>
        ))}
      </ul>
      {counted > 0 && (
        <div className="space-y-1.5">
          <Progress value={percent} aria-label="Séances réalisées cette semaine" />
          <p className="text-xs text-muted-foreground">
            {done} séance{done > 1 ? 's' : ''} réalisée{done > 1 ? 's' : ''} sur {counted}
          </p>
        </div>
      )}
    </section>
  )
}
