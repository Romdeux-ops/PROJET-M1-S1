import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

import { useAnimationsEnabled } from './use-animations-enabled'

/** Disque de musculation en contour, qui tourne tres lentement. */
export function WeightPlate({ className }: { className?: string }) {
  const animated = useAnimationsEnabled()
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className={cn('pointer-events-none', className)}
      animate={animated ? { rotate: 360 } : undefined}
      transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
    >
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="82" strokeDasharray="3 9" />
      <circle cx="100" cy="100" r="62" />
      <circle cx="100" cy="100" r="26" />
      <circle cx="100" cy="100" r="9" />
      {[0, 90, 180, 270].map((angle) => (
        <rect
          key={angle}
          x="95"
          y="30"
          width="10"
          height="22"
          rx="3"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
    </motion.svg>
  )
}
