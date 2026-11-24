import {
  CalendarCheck,
  Dumbbell,
  LayoutList,
  LineChart,
  MessagesSquare,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

import { Reveal } from './reveal'

interface Feature {
  icon: LucideIcon
  title: string
  text: string
}

const FEATURES: Feature[] = [
  {
    icon: Dumbbell,
    title: "Carnet d'entraînement",
    text: 'Séances, séries, charges et répétitions. Vos records personnels sont détectés automatiquement.',
  },
  {
    icon: LayoutList,
    title: 'Programmes',
    text: 'Créez, dupliquez et partagez vos programmes, notez-les, et retrouvez ceux de votre coach.',
  },
  {
    icon: CalendarCheck,
    title: 'Planning',
    text: 'Planifiez votre semaine. Votre coach valide les séances terminées, ou vous le faites vous-même.',
  },
  {
    icon: LineChart,
    title: 'Statistiques',
    text: 'Volume hebdomadaire, série en cours, assiduité et répartition par groupe musculaire.',
  },
  {
    icon: MessagesSquare,
    title: 'Coaching et messagerie',
    text: 'Invitations, suivi, notes privées, réservation de créneaux et conversation directe avec votre coach.',
  },
  {
    icon: Trophy,
    title: 'Badges et classement',
    text: "Gagnez de l'expérience à chaque séance, montez de niveau et débloquez des badges.",
  },
]

export function Features() {
  return (
    <section id="fonctionnalites" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">
            Fonctionnalités
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Tout ce qu&apos;il faut pour progresser
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pensé pour les athlètes autonomes comme pour ceux qui sont suivis par un coach.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-3xl border bg-card/70 p-7 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                <div className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-primary/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative grid size-12 place-items-center rounded-2xl bg-brand text-white shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="size-6" />
                </span>
                <h3 className="relative mt-5 text-lg font-semibold">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
