import { Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Fragment } from 'react'

import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
import { Button } from '@/components/ui/button'

import { AppPreview } from './app-preview'

const TITLE = ['Entraînez-vous', 'mieux,', 'progressez', 'plus', 'vite.']

export function Hero() {
  const animated = useAnimationsEnabled()

  return (
    <section className="relative px-4 pt-32 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-sm font-medium shadow-sm backdrop-blur">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            Nouveau · Génération de programmes par IA
          </div>

          <h1 className="text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {TITLE.map((word, i) => (
              <Fragment key={word}>
                <motion.span
                  className={i >= 2 ? 'inline-block text-brand' : 'inline-block'}
                  initial={animated ? { opacity: 0, y: 28, filter: 'blur(8px)' } : false}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: [0.2, 0.7, 0.3, 1] }}
                >
                  {word}
                </motion.span>{' '}
              </Fragment>
            ))}
          </h1>

          <motion.p
            className="max-w-xl text-lg text-muted-foreground"
            initial={animated ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            Un carnet d&apos;entraînement, un planning validé par votre coach, des statistiques, des
            badges à débloquer et des programmes générés pour vous : tout au même endroit.
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            initial={animated ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
          >
            <Button asChild size="lg" className="group relative overflow-hidden">
              <Link to="/register">
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.2s_ease-in-out]" />
                <span className="relative flex items-center gap-2">
                  Commencer gratuitement
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-card/60 backdrop-blur">
              <Link to="/login">
                <Sparkles /> J&apos;ai déjà un compte
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={animated ? { opacity: 0, scale: 0.92 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
        >
          <AppPreview />
        </motion.div>
      </div>
    </section>
  )
}
