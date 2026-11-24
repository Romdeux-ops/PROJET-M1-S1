import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  /** Variation en pourcentage par rapport a la periode precedente. */
  trend?: number
  hint?: string
  className?: string
}

export function StatCard({ label, value, icon: Icon, trend, hint, className }: StatCardProps) {
  const positive = trend !== undefined && trend >= 0
  return (
    <Card className={cn('gap-0 py-5 transition-all motion-safe:hover:-translate-y-0.5', className)}>
      <CardContent className="space-y-3 px-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-md shadow-primary/25">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
        {(trend !== undefined || hint) && (
          <div className="flex items-center gap-2 text-xs">
            {trend !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium',
                  positive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
                )}
              >
                {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {positive ? '+' : ''}
                {trend}%
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="space-y-3 px-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}
