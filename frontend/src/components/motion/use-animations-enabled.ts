import { useReducedMotion } from 'motion/react'

/**
 * Les animations decoratives sont coupees quand l'utilisateur demande moins de mouvement
 * (prefers-reduced-motion) et pendant les tests, ou elles rendraient les assertions instables.
 */
export function useAnimationsEnabled() {
  const reduced = useReducedMotion()
  return !reduced && import.meta.env.MODE !== 'test'
}
