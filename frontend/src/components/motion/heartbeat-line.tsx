import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

import { useAnimationsEnabled } from './use-animations-enabled'

const PATH =
  'M0 40 H110 L130 40 L145 10 L165 70 L185 25 L200 40 H330 L345 40 L358 5 L378 75 L398 20 L412 40 H600'

/** Trace d'electrocardiogramme : un trait lumineux la parcourt en boucle. */
export function HeartbeatLine({ className }: { className?: string }) {
  const animated = useAnimationsEnabled()
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 80"
      preserveAspectRatio="none"
      className={cn('h-auto w-full overflow-visible', className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATH} strokeWidth={2} opacity={0.18} vectorEffect="non-scaling-stroke" />
      {animated ? (
        <motion.path
          d={PATH}
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
          initial={{ pathLength: 0, pathOffset: 0, opacity: 1 }}
          animate={{ pathLength: [0, 0.55, 0.55], pathOffset: [0, 0.2, 1], opacity: [1, 1, 0] }}
          transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.4 }}
        />
      ) : null}
    </svg>
  )
}
