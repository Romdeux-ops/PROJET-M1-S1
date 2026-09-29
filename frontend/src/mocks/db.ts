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
  return [
    {
      id: 's-1',
      title: 'Push day',
      type: 'STRENGTH',
      date: isoDaysAgo(0),
      durationMinutes: 70,
      perceivedEffort: 8,
      exerciseCount: 6,
    },
    {
      id: 's-2',
      title: 'Footing récupération',
      type: 'CARDIO',
      date: isoDaysAgo(1),
      durationMinutes: 40,
      perceivedEffort: 4,
      exerciseCount: 1,
    },
    {
      id: 's-3',
      title: 'Pull day',
      type: 'STRENGTH',
      date: isoDaysAgo(2),
      durationMinutes: 65,
      perceivedEffort: 7,
      exerciseCount: 5,
    },
    {
      id: 's-4',
      title: 'Tabata 20/10',
      type: 'HIIT',
      date: isoDaysAgo(4),
      durationMinutes: 25,
      perceivedEffort: 9,
      exerciseCount: 4,
    },
    {
      id: 's-5',
      title: 'Leg day',
      type: 'STRENGTH',
      date: isoDaysAgo(5),
      durationMinutes: 80,
      perceivedEffort: 9,
      exerciseCount: 6,
    },
    {
      id: 's-6',
      title: 'Yoga & mobilité',
      type: 'MOBILITY',
      date: isoDaysAgo(8),
      durationMinutes: 45,
      perceivedEffort: 3,
      exerciseCount: 8,
    },
    {
      id: 's-7',
      title: 'Fractionné 10x400',
      type: 'CARDIO',
      date: isoDaysAgo(9),
      durationMinutes: 50,
      perceivedEffort: 8,
      exerciseCount: 1,
    },
    {
      id: 's-8',
      title: 'Full body',
      type: 'STRENGTH',
      date: isoDaysAgo(11),
      durationMinutes: 60,
      perceivedEffort: 7,
      exerciseCount: 7,
    },
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
