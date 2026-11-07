import { formatShortDate, formatTime } from '@/lib/format'

export function SlotWhen({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  return (
    <div>
      <p className="text-sm font-medium capitalize">{formatShortDate(startsAt)}</p>
      <p className="text-xs text-muted-foreground tabular-nums">
        {formatTime(startsAt)} – {formatTime(endsAt)}
      </p>
    </div>
  )
}
