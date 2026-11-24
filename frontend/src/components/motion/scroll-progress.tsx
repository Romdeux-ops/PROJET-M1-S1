import { motion, useScroll, useSpring } from 'motion/react'

import { useAnimationsEnabled } from './use-animations-enabled'

/** Fine barre en haut de page qui se remplit au fil du defilement. */
export function ScrollProgress() {
  const enabled = useAnimationsEnabled()
  return enabled ? <Bar /> : null
}

function Bar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-brand"
    />
  )
}
