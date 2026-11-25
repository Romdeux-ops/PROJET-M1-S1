import { motion } from 'motion/react'

import { AnimatedNumber } from '@/components/motion/animated-number'
import { HeartbeatLine } from '@/components/motion/heartbeat-line'
import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'

const SIZE = 320
const CENTER = SIZE / 2
const STROKE = 22

const RINGS = [
  {
    label: 'Volume',
    value: '7240',
    unit: 'kg',
    radius: 140,
    target: 0.82,
    color: 'var(--chart-1)',
  },
  {
    label: 'Séries',
    value: '64',
    unit: 'séries',
    radius: 108,
    target: 0.64,
    color: 'var(--chart-2)',
  },
  {
    label: 'Série en cours',
    value: '12',
    unit: 'jours',
    radius: 76,
    target: 0.45,
    color: 'var(--chart-3)',
  },
]

/** Visuel du hero : trois anneaux d'activite concentriques et une trace de battement de coeur. */
export function ActivityRings() {
  const animated = useAnimationsEnabled()

  return (
    <div className="mx-auto w-full max-w-md space-y-6" aria-hidden>
      <div className="relative mx-auto" style={{ width: SIZE, maxWidth: '100%' }}>
        <motion.svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full -rotate-90"
          animate={animated ? { scale: [1, 1.025, 1] } : undefined}
          transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
        >
          {RINGS.map((ring, i) => (
            <g key={ring.label}>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeOpacity={0.14}
                strokeWidth={STROKE}
              />
              <motion.circle
                cx={CENTER}
                cy={CENTER}
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 8px ${ring.color})` }}
                initial={{ pathLength: animated ? 0 : ring.target }}
                animate={{ pathLength: ring.target }}
                transition={{ duration: 1.6, delay: 0.5 + i * 0.25, ease: [0.2, 0.7, 0.3, 1] }}
              />
            </g>
          ))}
        </motion.svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Cette semaine
            </p>
            <p className="text-5xl font-black tracking-tighter tabular-nums">
              <AnimatedNumber value="7240" whenVisible />
            </p>
            <p className="text-sm font-medium text-muted-foreground">kg soulevés</p>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-3">
        {RINGS.map((ring) => (
          <li key={ring.label} className="rounded-2xl border bg-card/60 p-3 backdrop-blur-sm">
            <span
              className="mb-1.5 block h-1 w-8 rounded-full"
              style={{ background: ring.color }}
            />
            <p className="text-lg font-bold tabular-nums">
              <AnimatedNumber value={ring.value} whenVisible />
            </p>
            <p className="text-[11px] leading-tight text-muted-foreground">{ring.label}</p>
          </li>
        ))}
      </ul>

      <HeartbeatLine className="text-primary" />
    </div>
  )
}
