import { motion } from 'motion/react'
import { Fragment } from 'react'

import { useAnimationsEnabled } from './use-animations-enabled'

/** Texte dont les mots apparaissent l'un apres l'autre ; le texte reste un vrai texte pour les lecteurs d'ecran. */
export function AnimatedWords({
  text,
  className,
  delay = 0.1,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const enabled = useAnimationsEnabled()
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          <motion.span
            className="inline-block"
            initial={enabled ? { opacity: 0, y: 24, filter: 'blur(8px)' } : false}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.2, 0.7, 0.3, 1] }}
          >
            {word}
          </motion.span>{' '}
        </Fragment>
      ))}
    </span>
  )
}
