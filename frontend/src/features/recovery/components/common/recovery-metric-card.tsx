import type { LucideIcon } from 'lucide-react'

interface RecoveryMetricCardProps {
  label: string
  value: string | number | null | undefined
  unit?: string
  description?: string
  icon?: LucideIcon
  estimated?: boolean
  className?: string
}

export function RecoveryMetricCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
  estimated = false,
  className = '',
}: RecoveryMetricCardProps) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== '—' &&
    value !== '' &&
    (typeof value !== 'number' || Number.isFinite(value))

  return (
    <section
      className={`flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      </div>

      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight break-words tabular-nums sm:text-3xl">
          {hasValue ? value : '—'}
        </span>

        {hasValue && unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      {(description || estimated) && (
        <div className="mt-auto space-y-1">
          {estimated && hasValue && (
            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Estimation
            </span>
          )}

          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </section>
  )
}
