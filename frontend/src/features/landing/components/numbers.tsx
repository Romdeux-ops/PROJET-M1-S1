import { AnimatedNumber } from '@/components/motion/animated-number'

import { Reveal } from './reveal'

const NUMBERS = [
  { value: '18+', label: 'exercices dans le catalogue' },
  { value: '8', label: 'badges à débloquer' },
  { value: '7', label: 'séances par semaine générables' },
  { value: '3', label: 'rôles : athlète, coach, admin' },
]

export function Numbers() {
  return (
    <section id="chiffres" className="scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border bg-border shadow-sm lg:grid-cols-4">
          {NUMBERS.map((n) => (
            <div key={n.label} className="bg-card/80 p-7 text-center backdrop-blur">
              <p className="text-brand text-4xl font-bold tracking-tight tabular-nums">
                <AnimatedNumber value={n.value} whenVisible />
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{n.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
