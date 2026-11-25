import { Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Fragment } from 'react'

import { Magnetic } from '@/components/motion/magnetic'
import { Spotlight } from '@/components/motion/spotlight'
import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
import { WeightPlate } from '@/components/motion/weight-plate'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth/session'
import { cn } from '@/lib/utils'

import { ActivityRings } from './activity-rings'

const LINES = [
  { text: 'Travaille.', className: '' },
  {
    text: 'Progresse.',
    className: 'text-transparent [-webkit-text-stroke:2px_var(--foreground)]',
  },
  { text: 'Recommence.', className: 'text-brand' },
]

export function Hero() {
  const animated = useAnimationsEnabled()
  const connected = useSession((s) => s.token !== null)

  return (
    <section className="relative overflow-hidden px-4 pt-36 pb-28 sm:px-6 lg:px-8 lg:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(135deg,color-mix(in_oklab,var(--foreground)_5%,transparent)_0_2px,transparent_2px_16px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <Spotlight />
      <WeightPlate className="absolute -top-32 -right-48 size-[46rem] text-primary/20" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-9">
          <p className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.28em] text-muted-foreground uppercase">
            <span className="size-2.5 animate-pulse-ring rounded-full bg-primary" />
            Série 1 / 3 · Échauffement
          </p>

          <h1 className="text-6xl leading-[0.9] font-black tracking-tighter uppercase sm:text-7xl xl:text-8xl">
            {LINES.map((line, i) => (
              <Fragment key={line.text}>
                <span className="block overflow-hidden pr-4 pb-2">
                  <motion.span
                    className="block origin-left -skew-x-6"
                    initial={animated ? { y: '110%' } : false}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.85, delay: 0.1 + i * 0.13, ease: [0.2, 0.7, 0.3, 1] }}
                  >
                    <span className={cn(line.className)}>{line.text}</span>
                  </motion.span>
                </span>{' '}
              </Fragment>
            ))}
          </h1>

          <motion.p
            className="max-w-xl text-lg text-muted-foreground"
            initial={animated ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            Votre carnet d&apos;entraînement, un planning validé par votre coach, des statistiques,
            des badges à débloquer et des programmes générés pour vous.
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={animated ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Magnetic>
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden rounded-full px-7"
              >
                <Link to={connected ? '/dashboard' : '/register'}>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.2s_ease-in-out]" />
                  <span className="relative flex items-center gap-2">
                    {connected ? 'Accéder à mon espace' : 'Commencer gratuitement'}
                    <ArrowRight className="transition-transform motion-safe:group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </Magnetic>
            {!connected && (
              <Magnetic>
                <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                  <Link to="/login">
                    <Sparkles /> J&apos;ai déjà un compte
                  </Link>
                </Button>
              </Magnetic>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={animated ? { opacity: 0, scale: 0.9 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
        >
          <ActivityRings />
        </motion.div>
      </div>
    </section>
  )
}
