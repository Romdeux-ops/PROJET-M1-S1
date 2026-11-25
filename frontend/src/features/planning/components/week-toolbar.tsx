import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

interface WeekToolbarProps {
  days: Date[]
  isCurrentWeek: boolean
  onShift: (delta: number) => void
  onToday: () => void
}

export function WeekToolbar({ days, isCurrentWeek, onShift, onToday }: WeekToolbarProps) {
  const first = days[0]!
  const last = days[6]!
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-lg font-semibold tracking-tight">
          Du {dayMonth.format(first)} au {dayMonth.format(last)}
        </p>
        <p className="text-sm text-muted-foreground">
          {isCurrentWeek ? 'Cette semaine' : `Semaine de ${last.getFullYear()}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Semaine précédente"
          onClick={() => onShift(-1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isCurrentWeek}
          onClick={onToday}
        >
          Aujourd&apos;hui
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Semaine suivante"
          onClick={() => onShift(1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
