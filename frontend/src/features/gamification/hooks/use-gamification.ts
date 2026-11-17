import { useQuery } from '@tanstack/react-query'

import { gamificationApi } from '../api/gamification-api'

export const gamificationKeys = {
  all: ['gamification'] as const,
  me: () => [...gamificationKeys.all, 'me'] as const,
  leaderboard: () => [...gamificationKeys.all, 'leaderboard'] as const,
}

export function useGamificationProfile() {
  return useQuery({ queryKey: gamificationKeys.me(), queryFn: gamificationApi.me })
}

export function useLeaderboard() {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(),
    queryFn: gamificationApi.leaderboard,
  })
}
