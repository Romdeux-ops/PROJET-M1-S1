import { Check } from 'lucide-react'
import { motion } from 'motion/react'

import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
import { cn } from '@/lib/utils'

import { passwordScore, RULES } from './password-rules'

const LEVELS = [
  { label: 'Trop court', color: 'bg-destructive' },
  { label: 'Faible', color: 'bg-destructive' },
  { label: 'Moyen', color: 'bg-warning' },
  { label: 'Bon', color: 'bg-success' },
  { label: 'Excellent', color: 'bg-success' },
]

export function PasswordStrength({ password }: { password: string }) {
  const animated = useAnimationsEnabled()
  const score = passwordScore(password)
  const level = LEVELS[score]!

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn('h-full rounded-full', level.color)}
            initial={false}
            animate={{ width: `${(score / 4) * 100}%` }}
            transition={
              animated ? { type: 'spring', stiffness: 180, damping: 20 } : { duration: 0 }
            }
          />
        </div>
        <span className="w-16 text-right text-xs font-medium text-muted-foreground">
          {password ? level.label : ''}
        </span>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {RULES.map((rule) => {
          const ok = rule.test(password)
          return (
            <li
              key={rule.label}
              data-ok={ok}
              className={cn(
                'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
                ok
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-border text-muted-foreground',
              )}
            >
              <motion.span
                initial={false}
                animate={
                  animated ? { scale: ok ? [0.4, 1.3, 1] : 0.8, opacity: ok ? 1 : 0.35 } : {}
                }
                transition={{ duration: 0.35 }}
                className="inline-flex"
              >
                <Check className="size-3" />
              </motion.span>
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
