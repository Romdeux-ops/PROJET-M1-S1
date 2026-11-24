import { Outlet, useLocation } from '@tanstack/react-router'
import {
  CalendarCheck,
  Dumbbell,
  Flame,
  LineChart,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'motion/react'

import { Logo } from '@/components/logo'
import { AnimatedWords } from '@/components/motion/animated-words'
import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const CURRENT_YEAR = new Date().getFullYear()

const HIGHLIGHTS = [
  { icon: LineChart, text: 'Suivez chaque séance et visualisez vos progrès.' },
  { icon: CalendarCheck, text: 'Réservez vos créneaux avec votre coach en un clic.' },
  { icon: Sparkles, text: 'Générez un programme adapté grâce à l’IA.' },
]

/** Pastilles de verre qui flottent en fond du panneau de marque. */
const FLOATERS: { icon: LucideIcon; className: string; delay: number }[] = [
  { icon: Dumbbell, className: 'top-[16%] right-[10%]', delay: 0 },
  { icon: Flame, className: 'top-[52%] right-[5%]', delay: 1.4 },
  { icon: Trophy, className: 'bottom-[20%] right-[24%]', delay: 2.6 },
]

export function AuthLayout() {
  const pathname = useLocation({ select: (l) => l.pathname })
  const animated = useAnimationsEnabled()

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [mask-image:radial-gradient(circle_at_30%_30%,black,transparent_70%)] [background-size:28px_28px] opacity-40" />
        <div className="pointer-events-none absolute -top-32 -right-32 size-[28rem] animate-blob rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-[32rem] animate-blob rounded-full bg-black/15 blur-3xl [animation-delay:3s]" />
        <div className="pointer-events-none absolute top-1/3 left-1/3 size-72 animate-blob rounded-full bg-chart-2/25 blur-3xl [animation-delay:6s]" />

        {FLOATERS.map(({ icon: Icon, className, delay }) => (
          <span
            key={className}
            aria-hidden
            style={{ animationDelay: `${delay}s` }}
            className={cn(
              'pointer-events-none absolute grid size-14 animate-float-chip place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-md',
              className,
            )}
          >
            <Icon className="size-6 text-white/90" />
          </span>
        ))}

        <Logo className="relative [&>span:first-child]:bg-white/20 [&>span:first-child]:shadow-none" />

        <div className="relative max-w-md space-y-8">
          <h2 className="text-4xl leading-tight font-bold tracking-tight">
            <AnimatedWords text="Entraînez-vous mieux, progressez plus vite." />
          </h2>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                className="group flex items-center gap-3 text-white/90"
                initial={animated ? { opacity: 0, x: -24 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.7 + i * 0.15, ease: 'easeOut' }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25">
                  <Icon className="size-4.5" />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">© {CURRENT_YEAR} FitCoach · Projet M1</p>
      </aside>

      <main className="relative flex flex-col overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 animate-blob rounded-full bg-primary/15 blur-3xl lg:hidden" />
        <div className="relative flex items-center justify-between p-6">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="relative flex flex-1 items-center justify-center px-6 pb-16">
          <motion.div
            key={pathname}
            initial={animated ? { opacity: 0, x: 32, filter: 'blur(6px)' } : { opacity: 1 }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
