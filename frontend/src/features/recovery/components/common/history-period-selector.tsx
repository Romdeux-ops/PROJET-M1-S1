import { Button } from '@/components/ui/button'

export type HistoryPeriod = 7 | 14 | 30

interface HistoryPeriodSelectorProps {
  value: HistoryPeriod
  onChange: (value: HistoryPeriod) => void
}

const PERIODS: HistoryPeriod[] = [7, 14, 30]

export function HistoryPeriodSelector({ value, onChange }: HistoryPeriodSelectorProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border bg-muted/50 p-1"
      role="group"
      aria-label="Période de l'historique"
    >
      {PERIODS.map((period) => (
        <Button
          key={period}
          type="button"
          size="sm"
          variant={value === period ? 'default' : 'ghost'}
          aria-pressed={value === period}
          onClick={() => onChange(period)}
        >
          {period} j
        </Button>
      ))}
    </div>
  )
}
