import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useStartConversation } from '@/features/messaging'
import { ApiError } from '@/lib/api/errors'

import { matchingApi } from '../api/matching-api'
import type {
  Candidate,
  Match,
  MatchProfileFormValues,
  MyMatchProfile,
  SwipeDecision,
  SwipeResult,
} from '../schemas'

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
    mutationFn: ({ values, me }: { values: MatchProfileFormValues; me: MyMatchProfile }) =>
      matchingApi.saveProfile(values, me.missing),
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
    // Le cache est la pile de cartes : chaque swipe en retire une (voir useSwipe).
    // Un rechargement en arriere-plan remettrait des cartes en cours d'animation.
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

interface SwipeVariables {
  targetId: string
  decision: SwipeDecision
  /** Carte retiree du fil au moment du geste, pour la remettre en place si besoin. */
  removed?: { candidate: Candidate; index: number }
}

/** Seules les erreurs passageres (reseau, 5xx) rendent la carte : un 4xx serait refuse a nouveau. */
function isRetriable(error: unknown) {
  return !(error instanceof ApiError) || error.status >= 500
}

/**
 * Swipe optimiste : la carte quitte le cache du fil des le geste, ce qui
 * survit au changement d'onglet. Le retrait est synchrone (et non dans
 * `onMutate`, asynchrone) pour qu'un second clic immediat vise bien la carte
 * suivante. Les callbacks sont ceux du hook et non de `mutate`, pour
 * s'executer pour chaque swipe meme quand on enchaine les cartes.
 */
export function useSwipe({ onMatch }: { onMatch?: (match: Match) => void } = {}) {
  const queryClient = useQueryClient()
  const mutation = useMutation<SwipeResult, unknown, SwipeVariables>({
    mutationFn: ({ targetId, decision }) => matchingApi.swipe(targetId, decision),
    onError: (error, { removed }) => {
      if (!removed || !isRetriable(error)) return
      queryClient.setQueryData<Candidate[]>(matchingKeys.feed(), (feed = []) => {
        if (feed.some((c) => c.userId === removed.candidate.userId)) return feed
        const restored = [...feed]
        restored.splice(Math.min(removed.index, restored.length), 0, removed.candidate)
        return restored
      })
    },
    onSuccess: (result) => {
      if (!result.newMatch) return
      void queryClient.invalidateQueries({ queryKey: matchingKeys.matches() })
      if (result.match) onMatch?.(result.match)
    },
  })
  const { mutate } = mutation

  const swipe = useCallback(
    (targetId: string, decision: SwipeDecision) => {
      void queryClient.cancelQueries({ queryKey: matchingKeys.feed() })
      const feed = queryClient.getQueryData<Candidate[]>(matchingKeys.feed()) ?? []
      const index = feed.findIndex((c) => c.userId === targetId)
      const candidate = feed[index]
      if (candidate) {
        queryClient.setQueryData<Candidate[]>(
          matchingKeys.feed(),
          feed.filter((c) => c.userId !== targetId),
        )
      }
      mutate({ targetId, decision, removed: candidate ? { candidate, index } : undefined })
    },
    [queryClient, mutate],
  )

  return { swipe, isPending: mutation.isPending }
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
