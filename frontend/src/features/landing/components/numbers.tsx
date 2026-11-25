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
    <section id="chiffres" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-7xl">
        <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {NUMBERS.map((n, i) => (
            <div key={n.label} className={i > 0 ? 'lg:border-l lg:pl-8' : ''}>
              <dd className="text-6xl font-black tracking-tighter tabular-nums sm:text-7xl">
                <span className="text-brand">
                  <AnimatedNumber value={n.value} whenVisible />
                </span>
              </dd>
              <dt className="mt-2 max-w-[14rem] text-sm text-muted-foreground">{n.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
