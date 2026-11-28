import { api, unwrap } from '@/lib/api/client'

import type {
  Candidate,
  Match,
  MatchProfileFormValues,
  MyMatchProfile,
  SwipeDecision,
  SwipeResult,
} from '../schemas'

/**
 * Contrat du module matching (backend) :
 *   GET    /api/matching/profile            -> MyMatchProfile (toujours 200, `profile` nul avant inscription)
 *   PUT    /api/matching/profile            -> MyMatchProfile (cree ou remplace ; complete date de naissance et taille)
 *   GET    /api/matching/feed?limit=        -> Candidate[] (camp oppose, SUPER_LIKE recus puis score decroissant ; 409 sans profil)
 *   POST   /api/matching/swipes             -> SwipeResult (`newMatch` vrai pour le swipe qui cree le match)
 *   GET    /api/matching/matches            -> Match[] (actifs, plus recents d'abord)
 *   DELETE /api/matching/matches/{matchId}  -> 204 (ferme l'envoi de messages, garde l'historique)
 */
export const matchingApi = {
  getProfile: () => unwrap(api.GET('/api/matching/profile')) as Promise<MyMatchProfile>,
  saveProfile: (values: MatchProfileFormValues) =>
    unwrap(
      api.PUT('/api/matching/profile', {
        body: {
          ...values,
          about: values.about || undefined,
          city: values.city || undefined,
          heightCm: values.heightCm,
        },
      }),
    ) as Promise<MyMatchProfile>,
  feed: () =>
    unwrap(api.GET('/api/matching/feed', { params: { query: { limit: 20 } } })) as Promise<
      Candidate[]
    >,
  swipe: (targetId: string, decision: SwipeDecision) =>
    unwrap(
      api.POST('/api/matching/swipes', { body: { targetId, decision } }),
    ) as Promise<SwipeResult>,
  listMatches: () => unwrap(api.GET('/api/matching/matches')) as Promise<Match[]>,
  unmatch: (matchId: string) =>
    unwrap(api.DELETE('/api/matching/matches/{matchId}', { params: { path: { matchId } } })),
}
