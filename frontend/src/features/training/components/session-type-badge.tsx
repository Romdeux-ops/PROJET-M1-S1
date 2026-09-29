import { cn } from '@/lib/utils'

import { SESSION_TYPE_LABELS, type SessionType } from '../schemas'
import { SESSION_TYPE_STYLES } from './session-type-styles'

export function SessionTypeBadge({ type, className }: { type: SessionType; className?: string }) {
  const { icon: Icon, className: tone } = SESSION_TYPE_STYLES[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        tone,
        className,
      )}
    >
      <Icon className="size-3" />
      {SESSION_TYPE_LABELS[type]}
    </span>
  )
}
