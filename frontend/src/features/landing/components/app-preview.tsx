import { Flame, Trophy } from 'lucide-react'
import { motion } from 'motion/react'

import { AnimatedNumber } from '@/components/motion/animated-number'
import { TiltCard } from '@/components/motion/tilt-card'

const WEEK = [38, 62, 0, 74, 55, 90, 46]

/** Carte d'application flottante entouree de pastilles de verre : le visuel principal du hero. */
export function AppPreview() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-md" aria-hidden>
      <div className="absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-tr from-primary/40 to-chart-2/40 blur-[80px]" />

      <TiltCard className="absolute top-1/2 left-1/2 z-20 w-[320px] -translate-x-1/2 -translate-y-1/2">
        <div className="animate-float-card rounded-3xl bg-brand p-6 text-white shadow-2xl ring-1 shadow-primary/40 ring-white/20">
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>Niveau</span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
              Semaine 12
            </span>
          </div>
          <p className="mt-1 text-5xl font-bold tracking-tight tabular-nums">
            <AnimatedNumber value="7" whenVisible />
          </p>

          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-white/80">
              <span>
                <AnimatedNumber value="1240 XP" whenVisible />
              </span>
              <span>1250 XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: '0%' }}
                animate={{ width: '88%' }}
                transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="mt-6 flex h-16 items-end gap-1.5">
            {WEEK.map((height, i) => (
              <motion.span
                key={i}
                className="flex-1 rounded-md bg-white/70"
                style={{ opacity: height === 0 ? 0.25 : 1 }}
                initial={{ height: 4 }}
                animate={{ height: `${Math.max(height, 8)}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.7 + i * 0.07 }}
              />
            ))}
          </div>
        </div>
      </TiltCard>

      <div className="absolute top-10 left-0 z-30 flex animate-float-chip items-center gap-3 rounded-2xl border bg-card/80 p-3 pr-5 shadow-lg backdrop-blur-xl">
        <span className="grid size-10 place-items-center rounded-xl bg-warning/20 text-warning">
          <Trophy className="size-5" />
        </span>
        <span className="text-sm">
          <span className="block font-semibold">Nouveau record</span>
          <span className="block text-xs text-muted-foreground">Développé couché · 100 kg</span>
        </span>
      </div>

      <div className="absolute right-0 bottom-12 z-30 flex animate-float-chip items-center gap-3 rounded-2xl border bg-card/80 p-3 pr-5 shadow-lg backdrop-blur-xl [animation-delay:1.5s]">
        <span className="grid size-10 place-items-center rounded-xl bg-destructive/15 text-destructive">
          <Flame className="size-5" />
        </span>
        <span className="text-sm">
          <span className="block font-semibold">Série de 12 jours</span>
          <span className="block text-xs text-muted-foreground">+10 XP aujourd&apos;hui</span>
        </span>
      </div>
    </div>
  )
}
