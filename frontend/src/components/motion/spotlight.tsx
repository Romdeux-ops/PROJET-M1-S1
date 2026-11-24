import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'

import { useAnimationsEnabled } from './use-animations-enabled'

/** Faisceau de lumiere qui suit le curseur dans son conteneur (a placer en absolute inset-0). */
export function Spotlight() {
  const enabled = useAnimationsEnabled()
  return enabled ? <Beam /> : null
}

function Beam() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(-400)
  const y = useMotionValue(-400)
  const background = useMotionTemplate`radial-gradient(520px circle at ${x}px ${y}px, color-mix(in oklab, var(--primary) 22%, transparent), transparent 65%)`

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect()
      if (!box) return
      x.set(event.clientX - box.left)
      y.set(event.clientY - box.top)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background }}
    />
  )
}
