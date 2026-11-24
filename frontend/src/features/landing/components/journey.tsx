import { motion } from 'motion/react'

import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'

import { Reveal } from './reveal'

const SETS = [
  {
    title: 'Créez votre compte',
    text: 'Athlète ou coach, en quelques secondes. Invitez votre coach ou vos athlètes par e-mail.',
  },
  {
    title: 'Planifiez et entraînez-vous',
    text: 'Choisissez un programme, planifiez vos séances et enregistrez chaque série.',
  },
  {
    title: 'Progressez et débloquez',
    text: 'Suivez vos statistiques, battez vos records et gagnez badges et niveaux.',
  },
]

const RADIUS = 22

/** Minuteur de repos : l'anneau se remplit quand la carte entre dans l'ecran. */
function RestTimer({ delay }: { delay: number }) {
  const animated = useAnimationsEnabled()
  return (
    <div className="relative size-14 shrink-0">
      <svg viewBox="0 0 56 56" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={5}
        />
        <motion.circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={5}
          strokeLinecap="round"
          initial={{ pathLength: animated ? 0 : 1 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, delay, ease: 'linear' }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-bold tabular-nums">
        60 s
      </span>
    </div>
  )
}

export function Journey() {
  return (
    <section id="parcours" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.28em] text-primary uppercase">Parcours</p>
          <h2 className="mt-3 text-4xl leading-none font-black tracking-tighter uppercase sm:text-6xl">
            Trois séries,
            <br />
            <span className="text-transparent [-webkit-text-stroke:2px_var(--foreground)]">
              c&apos;est parti
            </span>
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {SETS.map((set, i) => (
            <li key={set.title}>
              <Reveal delay={i * 0.12} className="h-full">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-4 -right-1 text-[9rem] leading-none font-black tracking-tighter text-transparent transition-all duration-500 [-webkit-text-stroke:2px_var(--border)] group-hover:[-webkit-text-stroke:2px_var(--primary)]"
                  >
                    {i + 1}
                  </span>
                  <p className="relative font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    Série {i + 1} / {SETS.length}
                  </p>
                  <h3 className="relative mt-3 text-xl font-bold">{set.title}</h3>
                  <p className="relative mt-2 flex-1 text-muted-foreground">{set.text}</p>
                  <div className="relative mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                    <RestTimer delay={0.4 + i * 0.3} />
                    Repos avant la suivante
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
