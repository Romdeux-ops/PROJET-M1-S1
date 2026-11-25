import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('relative overflow-hidden rounded-md bg-accent', className)}
      {...props}
    >
      <span
        aria-hidden
        className="animate-skeleton-sweep absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/10"
      />
    </div>
  )
}

export { Skeleton }
