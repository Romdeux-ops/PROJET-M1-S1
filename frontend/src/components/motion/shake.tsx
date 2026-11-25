import { motion, useAnimationControls } from 'motion/react'
import { type ReactNode, useEffect } from 'react'

import { useAnimationsEnabled } from './use-animations-enabled'

/** Secoue son contenu a chaque nouvelle valeur de `trigger` (ex. une erreur de formulaire). */
export function Shake({
  trigger,
  children,
  className,
}: {
  trigger: unknown
  children: ReactNode
  className?: string
}) {
  const enabled = useAnimationsEnabled()
  if (!enabled) return <div className={className}>{children}</div>
  return (
    <Shaker trigger={trigger} className={className}>
      {children}
    </Shaker>
  )
}

function Shaker({
  trigger,
  children,
  className,
}: {
  trigger: unknown
  children: ReactNode
  className?: string
}) {
  const controls = useAnimationControls()

  useEffect(() => {
    if (!trigger) return
    void controls.start({ x: [0, -10, 9, -7, 5, -2, 0], transition: { duration: 0.5 } })
  }, [trigger, controls])

  return (
    <motion.div className={className} animate={controls}>
      {children}
    </motion.div>
  )
}
