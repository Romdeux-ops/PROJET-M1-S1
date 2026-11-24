import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { ReactNode } from 'react'

import { useAnimationsEnabled } from './use-animations-enabled'

/** Incline legerement son contenu vers le curseur (effet de profondeur). */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const enabled = useAnimationsEnabled()
  if (!enabled) return <div className={className}>{children}</div>
  return <Tilt className={className}>{children}</Tilt>
}

function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 140, damping: 18 })
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 140, damping: 18 })

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - box.left) / box.width - 0.5)
        y.set((event.clientY - box.top) / box.height - 0.5)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
