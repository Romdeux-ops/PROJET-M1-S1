import { motion, useMotionValue, useSpring } from 'motion/react'
import type { ReactNode } from 'react'

import { useAnimationsEnabled } from './use-animations-enabled'

/** Le contenu est legerement attire par le curseur quand celui-ci s'approche. */
export function Magnetic({
  children,
  strength = 0.28,
}: {
  children: ReactNode
  strength?: number
}) {
  const enabled = useAnimationsEnabled()
  if (!enabled) return <>{children}</>
  return <Pull strength={strength}>{children}</Pull>
}

function Pull({ children, strength }: { children: ReactNode; strength: number }) {
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })

  return (
    <motion.div
      className="inline-block"
      style={{ x, y }}
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - (box.left + box.width / 2)) * strength)
        y.set((event.clientY - (box.top + box.height / 2)) * strength)
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
