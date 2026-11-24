import { api, unwrap } from '@/lib/api/client'

import type { Badge, GamificationProfile, LeaderboardEntry } from '../schemas'

/**
 * Contrat du module gamification (backend) :
 *   GET /api/gamification/me           -> GamificationProfile (XP, niveau, tous les badges)
 *   GET /api/gamification/badges       -> Badge[] (catalogue, awardedAt nul)
 *   GET /api/gamification/leaderboard  -> LeaderboardEntry[] (top 20 + ligne de l'utilisateur)
 */
/**
 * Le schema OpenAPI genere par springdoc marque tous les champs comme
 * optionnels : on recast la reponse vers le contrat strict de `schemas.ts`.
 */
export const gamificationApi = {
  me: () => unwrap(api.GET('/api/gamification/me')) as Promise<GamificationProfile>,
  badges: () => unwrap(api.GET('/api/gamification/badges')) as Promise<Badge[]>,
  leaderboard: () =>
    unwrap(api.GET('/api/gamification/leaderboard')) as Promise<LeaderboardEntry[]>,
}
