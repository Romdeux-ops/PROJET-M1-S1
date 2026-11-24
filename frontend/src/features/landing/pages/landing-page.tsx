import { FinalCta } from '../components/final-cta'
import { BarbellProgress } from '../components/barbell-progress'
import { Features } from '../components/features'
import { Hero } from '../components/hero'
import { Journey } from '../components/journey'
import { LandingNav } from '../components/landing-nav'
import { Marquee } from '../components/marquee'
import { Numbers } from '../components/numbers'

const CURRENT_YEAR = new Date().getFullYear()

export function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <BarbellProgress />
      <LandingNav />
      <main>
        <Hero />
        <Marquee />
        <Numbers />
        <Features />
        <Journey />
        <FinalCta />
      </main>
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        © {CURRENT_YEAR} FitCoach · Projet M1
      </footer>
    </div>
  )
}
