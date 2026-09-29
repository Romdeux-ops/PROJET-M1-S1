import { cn } from '@/lib/utils'

function tone(effort: number) {
  if (effort >= 8) return 'bg-destructive'
  if (effort >= 5) return 'bg-primary'
  return 'bg-success'
}

export function EffortMeter({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2" title={`Effort ressenti : ${value}/10`}>
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={cn('h-3 w-1 rounded-full', i < value ? tone(value) : 'bg-muted')}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">{value}/10</span>
    </span>
  )
}
