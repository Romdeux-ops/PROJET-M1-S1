import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'

/** Fait apparaitre son contenu quand il entre dans l'ecran (une seule fois). */
export function Reveal({
  children,
  className,
  delay = 0,
  x = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
  x?: number
}) {
  const animated = useAnimationsEnabled()
  if (!animated) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.65, delay, ease: [0.2, 0.7, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
