import { Zap } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand shadow-md shadow-primary/30">
        <Zap className="size-4.5 fill-white text-white" />
      </span>
      {withText && <span className="text-lg font-bold tracking-tight">FitCoach</span>}
    </span>
  )
}
