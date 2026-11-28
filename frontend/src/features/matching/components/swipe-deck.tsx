import { Heart, RotateCcw, Star, X } from 'lucide-react'
import { AnimatePresence, motion, type PanInfo, useMotionValue, useTransform } from 'motion/react'
import { type ComponentProps, type ReactNode, useCallback, useEffect, useState } from 'react'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useSwipe } from '../hooks/use-matching'
import type { Candidate, Match, SwipeDecision } from '../schemas'
import { CandidateCard } from './candidate-card'
import { HeartDumbbell } from '@/components/heart-dumbbell-icon'

/** Distance (px) ou vitesse (px/s) au-dela de laquelle un glisser vaut decision. */
const SWIPE_DISTANCE = 120
const SWIPE_VELOCITY = 600

interface SwipeDeckProps {
  candidates: Candidate[]
  onMatch: (match: Match) => void
  onRefresh: () => void
  refreshing?: boolean
}

/**
 * Pile de cartes : glisser a droite pour liker, a gauche pour passer, vers le
 * haut pour un super like ; boutons et fleches du clavier font de meme.
 * Une carte quitte la pile des le geste ; elle y revient si le serveur refuse.
 */
export function SwipeDeck({ candidates, onMatch, onRefresh, refreshing }: SwipeDeckProps) {
  const swipe = useSwipe()
  const [gone, setGone] = useState<ReadonlySet<string>>(new Set())
  const [lastDecision, setLastDecision] = useState<SwipeDecision>('PASS')

  const remaining = candidates.filter((c) => !gone.has(c.userId))
  const top = remaining[0]
  const next = remaining[1]

  const decide = useCallback(
    (decision: SwipeDecision) => {
      if (!top) return
      const targetId = top.userId
      setLastDecision(decision)
      setGone((prev) => new Set(prev).add(targetId))
      swipe.mutate(
        { targetId, decision },
        {
          onSuccess: (result) => {
            if (result.newMatch && result.match) onMatch(result.match)
          },
          onError: () =>
            setGone((prev) => {
              const restored = new Set(prev)
              restored.delete(targetId)
              return restored
            }),
        },
      )
    },
    [top, swipe, onMatch],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]'))
        return
      if (event.key === 'ArrowRight') decide('LIKE')
      else if (event.key === 'ArrowLeft') decide('PASS')
      else if (event.key === 'ArrowUp') decide('SUPER_LIKE')
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decide])

  if (!top) {
    return (
      <EmptyState
        icon={HeartDumbbell}
        title="Plus personne à découvrir pour l'instant"
        description="Revenez plus tard : de nouveaux profils arrivent chaque jour. Élargir vos sports ou passer en « présentiel ou distance » aide aussi."
        action={
          <Button
            variant="outline"
            onClick={() => {
              setGone(new Set())
              onRefresh()
            }}
            disabled={refreshing}
          >
            <RotateCcw /> Actualiser
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[600px] w-full max-w-sm">
        {next && (
          <div
            className="pointer-events-none absolute inset-0 translate-y-3 scale-95 opacity-60"
            aria-hidden
          >
            <CandidateCard candidate={next} />
          </div>
        )}
        <AnimatePresence custom={lastDecision}>
          <DraggableCard key={top.userId} candidate={top} onDecide={decide} />
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4" role="group" aria-label="Décision">
        <RoundButton label="Passer" onClick={() => decide('PASS')} className="text-destructive">
          <X className="size-7" />
        </RoundButton>
        <RoundButton
          label="Super like"
          onClick={() => decide('SUPER_LIKE')}
          className="size-12 text-primary"
        >
          <Star className="size-5 fill-current" />
        </RoundButton>
        <RoundButton label="J'aime" onClick={() => decide('LIKE')} className="text-success">
          <Heart className="size-7 fill-current" />
        </RoundButton>
      </div>
      <p className="text-xs text-muted-foreground">Astuce : ← passer · → j'aime · ↑ super like</p>
    </div>
  )
}

const exitVariants = {
  exit: (decision: SwipeDecision) => ({
    x: decision === 'LIKE' ? 600 : decision === 'PASS' ? -600 : 0,
    y: decision === 'SUPER_LIKE' ? -800 : 40,
    rotate: decision === 'LIKE' ? 25 : decision === 'PASS' ? -25 : 0,
    opacity: 0,
    transition: { duration: 0.35 },
  }),
}

function DraggableCard({
  candidate,
  onDecide,
}: {
  candidate: Candidate
  onDecide: (decision: SwipeDecision) => void
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-18, 18])
  const likeOpacity = useTransform(x, [20, SWIPE_DISTANCE], [0, 1])
  const passOpacity = useTransform(x, [-SWIPE_DISTANCE, -20], [1, 0])
  const superOpacity = useTransform(y, [-SWIPE_DISTANCE, -20], [1, 0])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -SWIPE_DISTANCE || info.velocity.y < -SWIPE_VELOCITY) onDecide('SUPER_LIKE')
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onDecide('LIKE')
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) onDecide('PASS')
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      initial={{ scale: 0.95, y: 12, opacity: 0.6 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      variants={exitVariants}
      exit="exit"
    >
      <Stamp
        style={{ opacity: likeOpacity }}
        className="top-8 left-6 -rotate-12 border-success text-success"
      >
        J'aime
      </Stamp>
      <Stamp
        style={{ opacity: passOpacity }}
        className="top-8 right-6 rotate-12 border-destructive text-destructive"
      >
        Non
      </Stamp>
      <Stamp
        style={{ opacity: superOpacity }}
        className="bottom-32 left-1/2 -translate-x-1/2 border-primary text-primary"
      >
        Super like
      </Stamp>
      <CandidateCard candidate={candidate} />
    </motion.div>
  )
}

function Stamp({
  className,
  style,
  children,
}: {
  className: string
  style: ComponentProps<typeof motion.span>['style']
  children: ReactNode
}) {
  return (
    <motion.span
      aria-hidden
      style={style}
      className={cn(
        'pointer-events-none absolute z-10 rounded-lg border-4 bg-card/80 px-3 py-1 text-2xl font-extrabold tracking-wider uppercase',
        className,
      )}
    >
      {children}
    </motion.span>
  )
}

function RoundButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'size-16 rounded-full bg-card shadow-md transition-transform hover:scale-110 active:scale-95',
        className,
      )}
    >
      {children}
    </Button>
  )
}
