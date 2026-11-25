import * as React from 'react'
import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
import { cn } from '@/lib/utils'
import { Progress as ProgressPrimitive } from 'radix-ui'

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const animated = useAnimationsEnabled()
  const [mounted, setMounted] = React.useState(false)

  // La barre part de 0 puis se remplit ; les changements suivants passent par la transition CSS.
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const shown = animated && !mounted ? 0 : (value ?? 0)

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-transform duration-1000 ease-out"
        style={{ transform: `translateX(-${100 - shown}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
