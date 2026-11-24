import { AmbientBackground } from '@/components/motion/ambient-background'
import { ScrollProgress } from '@/components/motion/scroll-progress'

import { FinalCta } from '../components/final-cta'
import { Features } from '../components/features'
import { Hero } from '../components/hero'
import { Journey } from '../components/journey'
import { LandingNav } from '../components/landing-nav'
import { Numbers } from '../components/numbers'

const CURRENT_YEAR = new Date().getFullYear()

export function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <AmbientBackground />
      <ScrollProgress />
      <LandingNav />
      <main>
        <Hero />
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
