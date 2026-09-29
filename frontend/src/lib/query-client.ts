import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError, getErrorMessage } from '@/lib/api/errors'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Message de succes affiche en toast. */
      successMessage?: string
      /** Desactive le toast d'erreur global (la feature gere l'erreur elle-meme). */
      silentError?: boolean
    }
  }
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.isClientError) return false
          return failureCount < 2
        },
      },
    },
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        const message = mutation.meta?.successMessage
        if (message) toast.success(message)
      },
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.silentError) return
        toast.error(getErrorMessage(error))
      },
    }),
  })
}
