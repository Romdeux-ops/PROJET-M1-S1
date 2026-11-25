import { motion, useScroll, useSpring, useTransform } from 'motion/react'

import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'

/** Chaque disque apparait a un seuil de defilement ; { cote, hauteur } de la plus grosse a la plus petite. */
const PLATES = [
  { at: 0.12, x: 22, h: 34, color: 'var(--chart-5)' },
  { at: 0.3, x: 29, h: 28, color: 'var(--chart-4)' },
  { at: 0.5, x: 35, h: 22, color: 'var(--chart-3)' },
  { at: 0.72, x: 40, h: 16, color: 'var(--chart-2)' },
  { at: 0.9, x: 44, h: 11, color: 'var(--chart-1)' },
]

/** Indicateur de defilement : la barre se charge de disques et le poids monte au fil de la lecture. */
export function BarbellProgress() {
  const enabled = useAnimationsEnabled()
  return enabled ? <Bar /> : null
}

function Bar() {
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 22, mass: 0.4 })
  const kg = useTransform(smooth, [0, 1], [20, 140], { clamp: true })
  const label = useTransform(kg, (v) => `${Math.round(v / 2.5) * 2.5} kg`)

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-full border bg-card/85 py-2 pr-4 pl-3 shadow-lg backdrop-blur-md sm:right-6 sm:bottom-6"
    >
      <svg viewBox="0 0 120 40" className="h-8 w-24" fill="none">
        <rect x="4" y="18" width="112" height="4" rx="2" fill="currentColor" opacity={0.35} />
        <rect x="56" y="14" width="8" height="12" rx="2" fill="currentColor" opacity={0.5} />
        {PLATES.map((plate) => (
          <Plate key={plate.at} plate={plate} progress={smooth} />
        ))}
      </svg>
      <motion.span className="w-16 text-sm font-bold tabular-nums">{label}</motion.span>
    </div>
  )
}

function Plate({
  plate,
  progress,
}: {
  plate: (typeof PLATES)[number]
  progress: ReturnType<typeof useSpring>
}) {
  const scale = useTransform(progress, [plate.at - 0.04, plate.at + 0.02], [0, 1], { clamp: true })
  const y = 20 - plate.h / 2
  return (
    <>
      <motion.rect
        x={plate.x}
        y={y}
        width="5"
        height={plate.h}
        rx="1.5"
        fill={plate.color}
        style={{ scaleY: scale, originY: '50%', originX: '50%', transformBox: 'fill-box' }}
      />
      <motion.rect
        x={120 - plate.x - 5}
        y={y}
        width="5"
        height={plate.h}
        rx="1.5"
        fill={plate.color}
        style={{ scaleY: scale, originY: '50%', originX: '50%', transformBox: 'fill-box' }}
      />
    </>
  )
}
