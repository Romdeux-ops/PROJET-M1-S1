import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ScheduledSession } from '../schemas'
import { ScheduledItem } from './scheduled-item'

interface DayRowProps {
  label: string
  date: Date
  isToday: boolean
  isPast: boolean
  sessions: ScheduledSession[]
  onAdd: () => void
}

const month = new Intl.DateTimeFormat('fr-FR', { month: 'short' })

/** Un jour de l'agenda : pastille de date a gauche, seances (ou invitation a planifier) a droite. */
export function DayRow({ label, date, isToday, isPast, sessions, onAdd }: DayRowProps) {
  return (
    <section
      data-today={isToday}
      aria-label={`${label} ${date.getDate()} ${month.format(date)}`}
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:gap-5 sm:p-4',
        isToday ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30' : 'bg-card/60',
        isPast && !isToday && 'opacity-75',
      )}
    >
      <div className="flex items-center gap-3 sm:w-28 sm:shrink-0 sm:flex-col sm:items-start sm:gap-1">
        <span
          className={cn(
            'grid size-12 place-items-center rounded-xl text-xl font-bold tabular-nums',
            isToday
              ? 'bg-brand text-white shadow-md shadow-primary/30'
              : 'bg-muted text-foreground',
          )}
        >
          {date.getDate()}
        </span>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            {isToday ? "Aujourd'hui" : month.format(date)}
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {sessions.length === 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3">
            <p className="text-sm text-muted-foreground">Rien de prévu</p>
            <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
              <Plus /> Planifier
            </Button>
          </div>
        ) : (
          <>
            {sessions.map((session) => (
              <ScheduledItem key={session.id} session={session} />
            ))}
            <Button type="button" variant="ghost" size="xs" onClick={onAdd}>
              <Plus /> Ajouter ce jour-là
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
