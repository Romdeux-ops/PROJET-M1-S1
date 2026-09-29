import { queryOptions, useQuery } from '@tanstack/react-query'

import { statsApi } from '../api/stats-api'

export const statsKeys = {
  all: ['stats'] as const,
  overview: () => [...statsKeys.all, 'overview'] as const,
}

export const statsOverviewQuery = () =>
  queryOptions({ queryKey: statsKeys.overview(), queryFn: statsApi.overview })

export function useStatsOverview() {
  return useQuery(statsOverviewQuery())
}
