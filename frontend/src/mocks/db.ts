import type { TrainingSession } from '@/features/training'
import type { SessionUser } from '@/lib/auth/session'

import { isoDaysAgo } from './utils'

/**
 * "Base de donnees" en memoire partagee par les handlers MSW.
 * Remise a zero entre chaque test via `resetDb()`.
 */
export interface MockUser extends SessionUser {
  password: string
}

function seedUsers(): MockUser[] {
  return [
    {
      id: 'u-athlete',
      email: 'athlete@fitcoach.dev',
      firstName: 'Léa',
      lastName: 'Martin',
      roles: ['ATHLETE'],
      password: 'Password1',
    },
    {
      id: 'u-coach',
      email: 'coach@fitcoach.dev',
      firstName: 'Hugo',
      lastName: 'Bernard',
      roles: ['COACH'],
      password: 'Password1',
    },
    {
      id: 'u-admin',
      email: 'admin@fitcoach.dev',
      firstName: 'Admin',
      lastName: 'FitCoach',
      roles: ['ADMIN', 'COACH'],
      password: 'Password1',
    },
  ]
}

function seedSessions(): TrainingSession[] {
  const session = (id: string, title: string, daysAgo: number, durationMinutes: number): TrainingSession => ({
    id,
    title,
    performedAt: isoDaysAgo(daysAgo),
    durationMinutes,
    notes: null,
    sets: [],
    totalVolume: 0,
  })

  return [
    session('s-1', 'Push day', 0, 70),
    session('s-2', 'Footing récupération', 1, 40),
    session('s-3', 'Pull day', 2, 65),
    session('s-4', 'Tabata 20/10', 4, 25),
    session('s-5', 'Leg day', 5, 80),
    session('s-6', 'Yoga & mobilité', 8, 45),
    session('s-7', 'Fractionné 10x400', 9, 50),
    session('s-8', 'Full body', 11, 60),
  ]
}

export const db = {
  users: seedUsers(),
  sessions: seedSessions(),
}

export function resetDb() {
  db.users = seedUsers()
  db.sessions = seedSessions()
}

export function tokenFor(userId: string) {
  return `mock-token.${userId}`
}

export function userFromRequest(request: Request): MockUser | undefined {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
  const id = token?.startsWith('mock-token.') ? token.slice('mock-token.'.length) : undefined
  return db.users.find((u) => u.id === id)
}

export function toSessionUser({ password: _, ...user }: MockUser): SessionUser {
  return user
}
