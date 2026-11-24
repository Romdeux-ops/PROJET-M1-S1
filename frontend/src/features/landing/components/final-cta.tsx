import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Reveal } from './reveal'

export function FinalCta() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand p-10 text-center text-white shadow-2xl shadow-primary/30 sm:p-16">
          <div className="pointer-events-none absolute -top-24 -left-16 size-72 animate-blob rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-28 size-80 animate-blob rounded-full bg-black/15 blur-3xl [animation-delay:3s]" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-5xl">
            Prêt pour votre prochaine séance ?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/85">
            Créez votre compte, invitez votre coach et enregistrez votre première série.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="group bg-white text-foreground hover:bg-white/90"
            >
              <Link to="/register">
                Créer mon compte
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/login">Me connecter</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
