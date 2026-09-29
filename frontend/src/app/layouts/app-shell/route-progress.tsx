import { useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'

/** Fine barre de progression en haut de page pendant le chargement d'une route. */
export function RouteProgress() {
  const pending = useRouterState({ select: (s) => s.status === 'pending' })
  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.8, transition: { duration: 2, ease: 'easeOut' } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.3 } }}
        />
      )}
    </AnimatePresence>
  )
}
