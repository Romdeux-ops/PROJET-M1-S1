import { http, HttpResponse } from 'msw'

import type { Badge, GamificationProfile, LeaderboardEntry } from '@/features/gamification/schemas'

import { db, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

/** Memes badges et regles d'experience que la migration V11 et le backend. */
const BADGES: Array<Omit<Badge, 'awardedAt'> & { earnedWhen: (sessions: number) => boolean }> = [
  badge(
    'FIRST_SESSION',
    'Première séance',
    'Enregistrer sa première séance d’entraînement.',
    1,
    (n) => n >= 1,
  ),
  badge('SESSIONS_10', 'Habitué', 'Enregistrer 10 séances d’entraînement.', 10, (n) => n >= 10),
  badge('SESSIONS_50', 'Machine', 'Enregistrer 50 séances d’entraînement.', 50, (n) => n >= 50),
  badge('FIRST_PROGRAM', 'Architecte', 'Créer son premier programme.', 1, () => false),
  badge('STREAK_7', 'Semaine parfaite', 'S’entraîner 7 jours d’affilée.', 7, () => false),
  badge('STREAK_30', 'Mois de fer', 'S’entraîner 30 jours d’affilée.', 30, () => false),
  badge('FIRST_PR', 'Premier record', 'Établir son premier record personnel.', 1, () => false),
  badge('PRS_10', 'Collectionneur', 'Détenir 10 records personnels.', 10, () => false),
]

function badge(
  code: string,
  name: string,
  description: string,
  threshold: number,
  earnedWhen: (sessions: number) => boolean,
) {
  return { id: `badge-${code}`, code, name, description, threshold, earnedWhen }
}

const XP_PER_SESSION = 10

function levelOf(xp: number) {
  return 1 + Math.floor(Math.sqrt(xp / 50))
}

function xpForLevel(level: number) {
  return 50 * (level - 1) ** 2
}

export const gamificationHandlers = [
  http.get('*/api/gamification/me', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')

    const sessions = db.sessions.length
    const xp = sessions * XP_PER_SESSION
    const level = levelOf(xp)
    const awardedAt = new Date().toISOString()
    const profile: GamificationProfile = {
      xp,
      level,
      levelStartXp: xpForLevel(level),
      nextLevelXp: xpForLevel(level + 1),
      badges: BADGES.map(({ earnedWhen, ...rest }) => ({
        ...rest,
        awardedAt: earnedWhen(sessions) ? awardedAt : null,
      })),
    }
    return HttpResponse.json(profile)
  }),

  http.get('*/api/gamification/badges', async ({ request }) => {
    await networkDelay()
    if (!userFromRequest(request)) return problem(401, 'Session invalide.')
    return HttpResponse.json(
      BADGES.map(({ earnedWhen: _, ...rest }) => ({ ...rest, awardedAt: null })),
    )
  }),

  http.get('*/api/gamification/leaderboard', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')

    const own = db.sessions.length * XP_PER_SESSION
    const rivals = [
      { userId: 'mock-rival-1', displayName: 'Karim Benali', xp: 420 },
      { userId: 'mock-rival-2', displayName: 'Sofia Martin', xp: 180 },
    ]
    const entries: LeaderboardEntry[] = [
      ...rivals,
      { userId: user.id, displayName: `${user.firstName} ${user.lastName}`, xp: own },
    ]
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        displayName: entry.displayName,
        xp: entry.xp,
        level: levelOf(entry.xp),
        you: entry.userId === user.id,
      }))
    return HttpResponse.json(entries)
  }),
]
