import { Dumbbell } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { HeartbeatLine } from '@/components/motion/heartbeat-line'
import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'

const STEPS = [
  'Analyse de votre objectif…',
  'Sélection des exercices du catalogue…',
  'Répartition des séances sur la semaine…',
  'Dosage des séries et des repos…',
  'Dernières vérifications…',
]

/** Ecran d'attente : trace de battement de coeur et etapes qui defilent pendant la generation. */
export function GeneratingState() {
  const animated = useAnimationsEnabled()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!animated) return
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1300)
    return () => window.clearInterval(timer)
  }, [animated])

  return (
    <div role="status" aria-live="polite" className="space-y-5 py-2">
      <p className="sr-only">Génération en cours...</p>
      <div className="flex items-center gap-3">
        <motion.span
          className="grid size-10 place-items-center rounded-xl bg-brand text-white shadow-md shadow-primary/30"
          animate={animated ? { rotate: [0, -14, 14, 0], y: [0, -3, 0] } : undefined}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Dumbbell className="size-5" />
        </motion.span>
        <div className="min-h-5 flex-1 text-sm font-medium" aria-hidden>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={animated ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {STEPS[step]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <HeartbeatLine className="text-primary" />
    </div>
  )
}
