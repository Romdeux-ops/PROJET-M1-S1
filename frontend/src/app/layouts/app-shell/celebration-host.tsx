import { Confetti } from '@/components/motion/confetti'
import { useCelebration } from '@/lib/celebration'

/** Joue les confettis demandes depuis n'importe quelle page (record battu, badge obtenu). */
export function CelebrationHost() {
  const event = useCelebration((s) => s.event)
  return <Confetti fire={event} />
}
