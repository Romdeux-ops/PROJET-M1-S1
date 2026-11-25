import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'

/** Proprietes d'apparition a l'entree dans l'ecran, a etaler sur un motion.* ; vides quand les animations sont coupees. */
export function useRevealProps(delay = 0, x = 0, y = 16) {
  const animated = useAnimationsEnabled()
  if (!animated) return {}
  return {
    initial: { opacity: 0, x, y },
    whileInView: { opacity: 1, x: 0, y: 0 },
    viewport: { once: true, margin: '0px 0px -10% 0px' },
    transition: {
      duration: 0.55,
      delay,
      ease: [0.2, 0.7, 0.3, 1] as [number, number, number, number],
    },
  }
}
