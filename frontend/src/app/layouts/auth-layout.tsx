import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { ArrowLeft, CalendarCheck, LineChart, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

import { Logo } from '@/components/logo'
import { AnimatedWords } from '@/components/motion/animated-words'
import { HeartbeatLine } from '@/components/motion/heartbeat-line'
import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
import { WeightPlate } from '@/components/motion/weight-plate'
import { ThemeToggle } from '@/components/theme-toggle'

const CURRENT_YEAR = new Date().getFullYear()

const HIGHLIGHTS = [
  { icon: LineChart, text: 'Suivez chaque séance et visualisez vos progrès.' },
  { icon: CalendarCheck, text: 'Réservez vos créneaux avec votre coach en un clic.' },
  { icon: Sparkles, text: 'Générez un programme adapté grâce à l’IA.' },
]

function BackToHome({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all motion-safe:hover:-translate-x-0.5 ${className ?? ''}`}
    >
      <ArrowLeft className="size-4 transition-transform motion-safe:group-hover:-translate-x-1" />
      Retour à l&apos;accueil
    </Link>
  )
}

export function AuthLayout() {
  const pathname = useLocation({ select: (l) => l.pathname })
  const animated = useAnimationsEnabled()

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.07)_0_2px,transparent_2px_16px)]"
        />
        <WeightPlate className="absolute -right-40 -bottom-40 size-[40rem] text-white/15" />
        <HeartbeatLine className="absolute inset-x-0 top-[58%] text-white/70" />

        <div className="relative flex items-center justify-between">
          <Link to="/" aria-label="Accueil FitCoach">
            <Logo className="[&>span:first-child]:bg-white/20 [&>span:first-child]:shadow-none" />
          </Link>
          <BackToHome className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20" />
        </div>

        <div className="relative max-w-md space-y-8">
          <h2 className="text-5xl leading-[0.95] font-black tracking-tighter uppercase">
            <AnimatedWords text="Travaille. Progresse. Recommence." />
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
        <div className="relative flex items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Accueil FitCoach" className="lg:hidden">
              <Logo />
            </Link>
            <BackToHome className="border-border text-muted-foreground hover:border-primary/40 hover:text-foreground" />
          </div>
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
