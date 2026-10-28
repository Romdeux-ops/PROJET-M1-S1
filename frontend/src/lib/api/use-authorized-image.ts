import { type QueryCache, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchBlob } from './client'

const QUERY_KEY = 'authorized-image'
const watchedCaches = new WeakSet<QueryCache>()

/** Les URL `blob:` vivent aussi longtemps que leur entree de cache, puis sont liberees. */
function revokeOnRemoval(cache: QueryCache) {
  if (watchedCaches.has(cache)) return
  watchedCaches.add(cache)
  cache.subscribe((event) => {
    const { queryKey, state } = event.query
    if (event.type === 'removed' && queryKey[0] === QUERY_KEY && typeof state.data === 'string') {
      URL.revokeObjectURL(state.data)
    }
  })
}

/**
 * URL locale (`blob:`) d'une image servie par un endpoint authentifie. Les
 * images etant immuables (nom = UUID), elles ne sont jamais rechargees.
 */
export function useAuthorizedImage(path: string | null | undefined) {
  revokeOnRemoval(useQueryClient().getQueryCache())
  return useQuery({
    queryKey: [QUERY_KEY, path],
    queryFn: async () => URL.createObjectURL(await fetchBlob(path as string)),
    enabled: Boolean(path),
    staleTime: Infinity,
  })
}
