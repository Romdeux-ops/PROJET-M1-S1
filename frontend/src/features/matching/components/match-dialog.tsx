import { Loader2, MessageCircleHeart } from 'lucide-react'
import { motion } from 'motion/react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSession } from '@/lib/auth/session'
import { initials } from '@/lib/utils'

import type { Match } from '../schemas'
import { HeartDumbbell } from '@/components/heart-dumbbell-icon'

interface MatchDialogProps {
  match: Match | null
  onClose: () => void
  onMessage: (match: Match) => void
  messaging?: boolean
}

/** Celebration "C'est un match !" affichee par le swipe qui cree le match. */
export function MatchDialog({ match, onClose, onMessage, messaging }: MatchDialogProps) {
  const me = useSession((s) => s.user)

  return (
    <Dialog open={match !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden text-center sm:max-w-md">
        {match && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/25 to-transparent" />
            <DialogHeader className="relative items-center">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                className="mb-2 grid size-16 place-items-center rounded-2xl bg-brand text-white shadow-lg"
              >
                <HeartDumbbell className="size-9" />
              </motion.div>
              <DialogTitle className="text-3xl font-extrabold tracking-tight">
                C'est un match !
              </DialogTitle>
              <DialogDescription>
                {match.counterpartFirstName} et vous avez envie de vous entraîner ensemble.
                {match.counterpartSide === 'COACH'
                  ? ' Présentez votre objectif à votre futur coach.'
                  : ' Proposez une première séance.'}
              </DialogDescription>
            </DialogHeader>

            <div className="relative flex items-center justify-center py-2">
              <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 8, opacity: 1 }}>
                <Avatar className="size-20 border-4 border-background shadow-lg">
                  {me?.avatarUrl && <AvatarImage src={me.avatarUrl} alt="" />}
                  <AvatarFallback className="bg-brand text-xl font-semibold text-white">
                    {initials(me ? `${me.firstName} ${me.lastName}` : '?')}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: -8, opacity: 1 }}>
                <Avatar className="size-20 border-4 border-background shadow-lg">
                  {match.counterpartAvatarUrl && (
                    <AvatarImage src={match.counterpartAvatarUrl} alt="" />
                  )}
                  <AvatarFallback className="bg-brand text-xl font-semibold text-white">
                    {initials(match.counterpartFirstName)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={() => onMessage(match)} disabled={messaging}>
                {messaging ? <Loader2 className="animate-spin" /> : <MessageCircleHeart />}
                Envoyer un message
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Continuer à swiper
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
