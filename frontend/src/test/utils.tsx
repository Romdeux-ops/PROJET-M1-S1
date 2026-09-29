import { QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement, ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { type Role, useSession } from '@/lib/auth/session'
import { createQueryClient } from '@/lib/query-client'
import { tokenFor } from '@/mocks/db'

/** Connecte un utilisateur de demo (voir src/mocks/db.ts) avant le rendu. */
export function loginAs(role: Role = 'ATHLETE') {
  const id = role === 'ATHLETE' ? 'u-athlete' : role === 'COACH' ? 'u-coach' : 'u-admin'
  useSession.getState().setSession(tokenFor(id), {
    id,
    email: `${role.toLowerCase()}@fitcoach.dev`,
    firstName: 'Test',
    lastName: 'User',
    roles: [role],
  })
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  // Meme configuration que l'app (toasts globaux, gestion d'erreurs), sans retry.
  const queryClient = createQueryClient()
  queryClient.setDefaultOptions({
    queries: { ...queryClient.getDefaultOptions().queries, retry: false },
    mutations: { retry: false },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    )
  }
  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  }
}
