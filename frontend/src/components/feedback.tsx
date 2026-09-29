import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-primary', className)} />
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spinner className="size-7" />
    </div>
  )
}

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  className?: string
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center',
        className,
      )}
    >
      <AlertTriangle className="size-6 text-destructive" />
      <div>
        <p className="font-medium">Une erreur est survenue</p>
        <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw /> Réessayer
        </Button>
      )}
    </div>
  )
}
