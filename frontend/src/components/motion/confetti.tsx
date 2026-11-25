import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import { useAnimationsEnabled } from './use-animations-enabled'

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
const PARTICLES = 48
const DURATION_MS = 2600

interface Particle {
  id: number
  color: string
  x: number
  y: number
  rotate: number
  size: number
  delay: number
  duration: number
  round: boolean
}

/** Pseudo-aleatoire deterministe : un rendu reste pur et les confettis gardent un aspect varie. */
function noise(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLES }, (_, id) => ({
    id,
    color: COLORS[id % COLORS.length]!,
    x: (noise(id + 1) - 0.5) * 520,
    y: 120 + noise(id + 101) * 420,
    rotate: (noise(id + 201) - 0.5) * 900,
    size: 6 + noise(id + 301) * 7,
    delay: noise(id + 401) * 0.15,
    duration: 1.8 + noise(id + 501) * 0.6,
    round: noise(id + 601) > 0.5,
  }))
}

/** Pluie de confettis plein ecran, jouee une fois par valeur de `fire` (identifiant de l'evenement). */
export function Confetti({ fire }: { fire: string | null }) {
  const enabled = useAnimationsEnabled()
  const [dismissed, setDismissed] = useState<string | null>(null)
  const active = enabled && fire && fire !== dismissed ? fire : null

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => setDismissed(active), DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [active])

  if (!active) return null
  return <Burst key={active} />
}

function Burst() {
  const particles = useMemo(() => createParticles(), [])
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={p.round ? 'absolute rounded-full' : 'absolute rounded-[2px]'}
          style={{ left: '50%', top: '28%', width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.6 }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.7, 0.3, 1] }}
        />
      ))}
    </div>
  )
}
