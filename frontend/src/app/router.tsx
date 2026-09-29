import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'

import { PageLoader } from '@/components/feedback'
import { NotFound } from '@/components/not-found'
import { RouteError } from '@/components/route-error'
import { routeTree } from '@/routeTree.gen'

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    // Les donnees sont gerees par TanStack Query : le routeur ne met pas en cache les loaders.
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: PageLoader,
    defaultErrorComponent: RouteError,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
