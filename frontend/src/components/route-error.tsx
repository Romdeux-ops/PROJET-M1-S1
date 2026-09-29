import type { ErrorComponentProps } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'

import { ErrorState } from '@/components/feedback'

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <div className="mx-auto max-w-lg py-16">
      <ErrorState
        error={error}
        onRetry={() => {
          reset()
          void router.invalidate()
        }}
      />
    </div>
  )
}
