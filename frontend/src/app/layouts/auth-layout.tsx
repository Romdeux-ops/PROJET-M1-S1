import { Outlet } from '@tanstack/react-router'
import { CalendarCheck, LineChart, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'

const CURRENT_YEAR = new Date().getFullYear()

const HIGHLIGHTS = [
  { icon: LineChart, text: 'Suivez chaque séance et visualisez vos progrès.' },
  { icon: CalendarCheck, text: 'Réservez vos créneaux avec votre coach en un clic.' },
  { icon: Sparkles, text: 'Générez un programme adapté grâce à l’IA.' },
]

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-[32rem] rounded-full bg-black/10 blur-3xl" />

        <Logo className="relative [&>span:first-child]:bg-white/20 [&>span:first-child]:shadow-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative max-w-md space-y-8"
        >
          <h2 className="text-4xl leading-tight font-bold tracking-tight">
            Entraînez-vous mieux, progressez plus vite.
          </h2>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon className="size-4.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-sm text-white/70">© {CURRENT_YEAR} FitCoach · Projet M1</p>
      </aside>

      <main className="relative flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
