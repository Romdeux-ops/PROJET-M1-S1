import { AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { getErrorMessage } from '@/lib/api/errors'

export function FormError({ error }: { error: unknown }) {
  return (
    <AnimatePresence>
      {error ? (
        <motion.div
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{getErrorMessage(error)}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
