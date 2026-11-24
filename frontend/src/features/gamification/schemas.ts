/** Un badge du catalogue ; `awardedAt` est nul tant qu'il n'est pas gagne. */
export interface Badge {
  id: string
  code: string
  name: string
  description: string
  threshold: number
  awardedAt: string | null
}

/** Reponse de GET /api/gamification/me. */
export interface GamificationProfile {
  xp: number
  level: number
  /** XP a partir duquel le niveau courant commence. */
  levelStartXp: number
  /** XP a atteindre pour passer au niveau suivant. */
  nextLevelXp: number
  badges: Badge[]
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  xp: number
  level: number
  /** Vrai pour la ligne de l'utilisateur connecte. */
  you: boolean
}
