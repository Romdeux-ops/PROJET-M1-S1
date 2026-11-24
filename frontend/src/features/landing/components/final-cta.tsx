import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { HeartbeatLine } from '@/components/motion/heartbeat-line'
import { Magnetic } from '@/components/motion/magnetic'
import { WeightPlate } from '@/components/motion/weight-plate'
import { Button } from '@/components/ui/button'

import { Reveal } from './reveal'

export function FinalCta() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand p-10 text-white shadow-2xl shadow-primary/30 sm:p-16">
          <WeightPlate className="absolute -top-24 -right-24 size-[28rem] text-white/20" />
          <div className="relative max-w-2xl">
            <h2 className="text-4xl leading-[0.95] font-black tracking-tighter uppercase sm:text-6xl">
              Prêt pour la prochaine série ?
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/85">
              Créez votre compte, invitez votre coach et enregistrez votre première série.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="group rounded-full bg-white px-7 text-foreground hover:bg-white/90"
                >
                  <Link to="/register">
                    Créer mon compte
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </Magnetic>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full text-white hover:bg-white/15 hover:text-white"
              >
                <Link to="/login">Me connecter</Link>
              </Button>
            </div>
          </div>
          <HeartbeatLine className="relative mt-12 text-white" />
        </div>
      </Reveal>
    </section>
  )
}
