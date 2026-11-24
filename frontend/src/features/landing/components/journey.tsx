import { motion } from 'motion/react'

import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'

import { Reveal } from './reveal'

const STEPS = [
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

export function Journey() {
  const animated = useAnimationsEnabled()

  return (
    <section id="parcours" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">Parcours</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Trois étapes, et c&apos;est parti
          </h2>
        </Reveal>

        <ol className="relative mt-14 space-y-10 pl-12 sm:pl-16">
          <div className="absolute top-2 bottom-2 left-[19px] w-0.5 rounded-full bg-border sm:left-[27px]" />
          {animated ? (
            <motion.div
              className="absolute top-2 bottom-2 left-[19px] w-0.5 origin-top rounded-full bg-brand sm:left-[27px]"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '0px 0px -25% 0px' }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
          ) : (
            <div className="absolute top-2 bottom-2 left-[19px] w-0.5 rounded-full bg-brand sm:left-[27px]" />
          )}
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              <Reveal x={-24} delay={i * 0.1}>
                <span className="absolute top-0 -left-12 grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white shadow-lg ring-4 shadow-primary/30 ring-background sm:-left-16 sm:size-14 sm:text-lg">
                  {i + 1}
                </span>
                <div className="rounded-2xl border bg-card/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:translate-x-1 hover:border-primary/40">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
