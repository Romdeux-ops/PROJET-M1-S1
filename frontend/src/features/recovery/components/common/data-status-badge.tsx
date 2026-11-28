import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

import { DATA_STATUS_LABELS, type RecoveryDataStatus } from '../../api/recovery-types'

interface DataStatusBadgeProps {
  status?: RecoveryDataStatus | null
  showDescription?: boolean
}

const STATUS_CONFIG = {
  COMPLETE: {
    icon: CheckCircle2,
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    description: 'Les informations attendues par le modèle sont disponibles.',
  },

  PARTIAL: {
    icon: AlertTriangle,
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    description:
      'Certaines informations sont manquantes ou estimées. Les résultats doivent être interprétés avec prudence.',
  },

  INSUFFICIENT: {
    icon: Info,
    className: 'border-border bg-muted text-muted-foreground',
    description: 'Renseignez davantage de données pour obtenir une évaluation plus complète.',
  },
} as const

export function DataStatusBadge({ status, showDescription = false }: DataStatusBadgeProps) {
  const resolvedStatus = status ?? 'INSUFFICIENT'

  const config = STATUS_CONFIG[resolvedStatus]
  const Icon = config.icon

  return (
    <div className="space-y-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
      >
        <Icon className="size-3.5" aria-hidden="true" />

        {DATA_STATUS_LABELS[resolvedStatus]}
      </span>

      {showDescription && (
        <p className="text-xs leading-relaxed text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
