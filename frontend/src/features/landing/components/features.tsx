import { Award, Check, Dumbbell, Flame, Medal, Star, Target, Trophy, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { AnimatedNumber } from '@/components/motion/animated-number'
import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
import { cn } from '@/lib/utils'

import { Reveal } from './reveal'
import { useRevealProps } from './use-reveal-props'

/* ---------- Mini-illustrations : une par fonctionnalite ---------- */

const SETS = [
  { kg: 80, reps: 8 },
  { kg: 85, reps: 6 },
  { kg: 90, reps: 5 },
]

function SetRow({ index, kg, reps }: { index: number; kg: number; reps: number }) {
  const animated = useAnimationsEnabled()
  const reveal = useRevealProps(0.15 + index * 0.18, -18, 0)
  const last = index === SETS.length - 1
  return (
    <motion.div
      {...reveal}
      className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2"
    >
      <span className="text-muted-foreground">Série {index + 1}</span>
      <span className="flex items-center gap-2 font-bold tabular-nums">
        {kg} kg × {reps}
        {last && (
          <motion.span
            className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-warning"
            initial={animated ? { scale: 0, rotate: -24 } : false}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 1.1 }}
          >
            RECORD
          </motion.span>
        )}
      </span>
    </motion.div>
  )
}

function SetsLog() {
  return (
    <div className="space-y-2 font-mono text-sm">
      <p className="mb-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Développé couché
      </p>
      {SETS.map((set, i) => (
        <SetRow key={i} index={i} {...set} />
      ))}
    </div>
  )
}

const FAN = [
  {
    label: 'Push',
    className: '-rotate-6 motion-safe:group-hover:-translate-x-8 group-hover:-rotate-12',
  },
  { label: 'Pull', className: 'translate-y-3 rotate-2 motion-safe:group-hover:translate-y-4' },
  {
    label: 'Legs',
    className:
      'translate-y-6 rotate-[9deg] motion-safe:group-hover:translate-x-8 group-hover:rotate-[15deg]',
  },
]

function ProgramFan() {
  return (
    <div className="relative h-36">
      {FAN.map((card) => (
        <div
          key={card.label}
          className={cn(
            'absolute inset-x-6 top-1 h-24 overflow-hidden rounded-2xl border bg-card shadow-md transition-transform duration-500',
            card.className,
          )}
        >
          <div className="h-2 bg-brand" />
          <p className="px-4 pt-3 text-lg font-black tracking-tight uppercase italic">
            {card.label}
          </p>
          <p className="px-4 text-xs text-muted-foreground">5 exercices · 4 séries</p>
        </div>
      ))}
    </div>
  )
}

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const DONE = new Set([0, 1, 3])
const TODAY = 4

function DayPill({ index, label }: { index: number; label: string }) {
  const reveal = useRevealProps(0.1 + index * 0.06, 0, 12)
  const done = DONE.has(index)
  const today = index === TODAY
  return (
    <motion.span
      {...reveal}
      className={cn(
        'grid size-9 place-items-center rounded-xl text-sm font-bold',
        done && 'bg-brand text-white',
        today && 'animate-pulse-ring bg-accent text-accent-foreground ring-2 ring-primary',
        !done && !today && 'bg-muted text-muted-foreground',
      )}
    >
      {done ? <Check className="size-4" /> : label}
    </motion.span>
  )
}

function WeekStrip() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        {DAYS.map((label, i) => (
          <DayPill key={i} index={i} label={label} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">3 séances validées par votre coach</p>
    </div>
  )
}

const BARS = [40, 62, 35, 82, 56, 96, 70]

function Bar({ index, value }: { index: number; value: number }) {
  const animated = useAnimationsEnabled()
  return (
    <motion.span
      className="flex-1 rounded-t-md bg-brand"
      initial={animated ? { height: 6 } : false}
      whileInView={{ height: `${value}%` }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 110, damping: 14, delay: 0.15 + index * 0.07 }}
      style={animated ? undefined : { height: `${value}%` }}
    />
  )
}

function MiniBars() {
  return (
    <div className="space-y-2">
      <p className="text-brand text-4xl font-black tracking-tighter tabular-nums">
        <AnimatedNumber value="+18%" whenVisible />
      </p>
      <div className="flex h-20 items-end gap-1.5">
        {BARS.map((value, i) => (
          <Bar key={i} index={i} value={value} />
        ))}
      </div>
    </div>
  )
}

function TypingDots() {
  const animated = useAnimationsEnabled()
  return (
    <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={animated ? { y: [0, -4, 0] } : undefined}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

function Chat() {
  const coach = useRevealProps(0.1, -20, 0)
  const athlete = useRevealProps(0.5, 20, 0)
  return (
    <div className="space-y-2 text-sm">
      <motion.p {...coach} className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
        Beau record sur le développé !
      </motion.p>
      <motion.p
        {...athlete}
        className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-white"
      >
        Merci coach, on vise 95 kg ?
      </motion.p>
      <TypingDots />
    </div>
  )
}

const BADGES = [Award, Flame, Dumbbell, Trophy, Target, Zap, Star, Medal]
const EARNED = 5

function BadgeIcon({ index, icon: Icon }: { index: number; icon: typeof Award }) {
  const animated = useAnimationsEnabled()
  const earned = index < EARNED
  return (
    <motion.span
      className={cn(
        'grid size-12 place-items-center rounded-2xl',
        earned
          ? 'bg-brand text-white shadow-md shadow-primary/30'
          : 'bg-muted text-muted-foreground/50',
      )}
      initial={animated ? { scale: 0, rotate: -30 } : false}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      whileHover={animated ? { scale: 1.18, rotate: -8 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.1 + index * 0.07 }}
    >
      <Icon className="size-6" />
    </motion.span>
  )
}

function BadgeRow() {
  const animated = useAnimationsEnabled()
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {BADGES.map((icon, i) => (
          <BadgeIcon key={i} index={i} icon={icon} />
        ))}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-brand"
          initial={animated ? { width: '0%' } : false}
          whileInView={{ width: '72%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
          style={animated ? undefined : { width: '72%' }}
        />
      </div>
    </div>
  )
}

/* ---------- Grille bento ---------- */

interface CardProps {
  title: string
  text: string
  className?: string
  children: ReactNode
}

function BentoCard({ title, text, className, children }: CardProps) {
  return (
    <Reveal className={cn('h-full', className)}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 motion-safe:hover:-translate-y-1">
        <div className="flex-1">{children}</div>
        <h3 className="mt-6 text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </article>
    </Reveal>
  )
}

export function Features() {
  return (
    <section id="fonctionnalites" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.28em] text-primary uppercase">
            Fonctionnalités
          </p>
          <h2 className="mt-3 text-4xl leading-none font-black tracking-tighter uppercase sm:text-6xl">
            Tout pour <span className="text-brand">progresser</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pour les athlètes autonomes comme pour ceux qui sont suivis par un coach.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          <BentoCard
            className="lg:col-span-3"
            title="Carnet d'entraînement"
            text="Enregistrez chaque série. Vos records personnels sont détectés automatiquement."
          >
            <SetsLog />
          </BentoCard>
          <BentoCard
            className="lg:col-span-3"
            title="Programmes"
            text="Créez, dupliquez, partagez et notez. Retrouvez aussi les programmes de votre coach."
          >
            <ProgramFan />
          </BentoCard>
          <BentoCard
            className="lg:col-span-2"
            title="Planning validé"
            text="Planifiez votre semaine. Votre coach valide vos séances terminées."
          >
            <WeekStrip />
          </BentoCard>
          <BentoCard
            className="lg:col-span-2"
            title="Statistiques"
            text="Volume, série en cours, assiduité et répartition par muscle."
          >
            <MiniBars />
          </BentoCard>
          <BentoCard
            className="sm:col-span-2 lg:col-span-2"
            title="Coaching et messagerie"
            text="Invitations, suivi, notes privées, créneaux et conversation directe."
          >
            <Chat />
          </BentoCard>
          <BentoCard
            className="sm:col-span-2 lg:col-span-6"
            title="Badges, niveaux et classement"
            text="Gagnez de l'expérience à chaque séance et débloquez des badges."
          >
            <BadgeRow />
          </BentoCard>
        </div>
      </div>
    </section>
  )
}
