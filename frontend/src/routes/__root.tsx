import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import { NotFound } from '@/components/not-found'

export interface RouterContext {
  queryClient: QueryClient
}

// Outils de developpement (routes, requetes) : masques par defaut, a activer avec VITE_DEVTOOLS=true.
const Devtools =
  import.meta.env.DEV && import.meta.env.VITE_DEVTOOLS === 'true'
    ? lazy(() =>
        Promise.all([
          import('@tanstack/react-router-devtools'),
          import('@tanstack/react-query-devtools'),
        ]).then(([router, query]) => ({
          default: () => (
            <>
              <router.TanStackRouterDevtools position="bottom-right" />
              <query.ReactQueryDevtools buttonPosition="bottom-left" />
            </>
          ),
        })),
      )
    : () => null

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <Suspense>
        <Devtools />
      </Suspense>
    </>
  )
}
