import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useStartConversation } from '@/features/messaging'

import { matchingApi } from '../api/matching-api'
import type { MatchProfileFormValues, SwipeDecision } from '../schemas'

export const matchingKeys = {
  all: ['matching'] as const,
  profile: () => [...matchingKeys.all, 'profile'] as const,
  feed: () => [...matchingKeys.all, 'feed'] as const,
  matches: () => [...matchingKeys.all, 'matches'] as const,
}

export function useMatchProfile() {
  return useQuery({ queryKey: matchingKeys.profile(), queryFn: matchingApi.getProfile })
}

export function useSaveMatchProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: MatchProfileFormValues) => matchingApi.saveProfile(values),
    meta: { successMessage: 'Profil FitMatch enregistré' },
    onSuccess: (profile) => {
      queryClient.setQueryData(matchingKeys.profile(), profile)
      // Date de naissance et taille ont pu completer le profil du compte.
      queryClient.invalidateQueries({ queryKey: ['identity', 'profile'] })
      queryClient.invalidateQueries({ queryKey: matchingKeys.feed() })
    },
  })
}

export function useFeed(enabled: boolean) {
  return useQuery({
    queryKey: matchingKeys.feed(),
    queryFn: matchingApi.feed,
    enabled,
    // Le fil se vide carte par carte localement : pas de rechargement en arriere-plan.
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

export function useSwipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ targetId, decision }: { targetId: string; decision: SwipeDecision }) =>
      matchingApi.swipe(targetId, decision),
    onSuccess: (result) => {
      if (result.newMatch) queryClient.invalidateQueries({ queryKey: matchingKeys.matches() })
    },
  })
}

export function useMatches() {
  return useQuery({ queryKey: matchingKeys.matches(), queryFn: matchingApi.listMatches })
}

export function useUnmatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => matchingApi.unmatch(matchId),
    meta: { successMessage: 'Match retiré' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matchingKeys.matches() }),
  })
}

/** Ouvre (ou retrouve) la conversation avec un match et renvoie son identifiant. */
export function useMessageMatch() {
  const startConversation = useStartConversation()
  return {
    open: (counterpartId: string) => startConversation.mutateAsync(counterpartId).then((c) => c.id),
    isPending: startConversation.isPending,
  }
}
