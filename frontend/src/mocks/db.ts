import type { CoachPost } from '@/features/coaching/schemas'
import type { Exercise, MuscleGroup, Tag } from '@/features/catalog/schemas'
import type { ProfileResponse } from '@/features/identity/schemas'
import type { ScheduledSession } from '@/features/planning/schemas'
import type { Program } from '@/features/program/schemas'
import type { TrainingSession } from '@/features/training'
import type { SessionUser } from '@/lib/auth/session'

import { isoDaysAgo } from './utils'

/**
 * "Base de donnees" en memoire partagee par les handlers MSW.
 * Remise a zero entre chaque test via `resetDb()`.
 */
export interface MockUser extends SessionUser {
  password: string
  profile: Omit<ProfileResponse, 'id' | 'email' | 'firstName' | 'lastName' | 'roles'>
}

export interface MockCoachAthlete {
  coachId: string
  athleteId: string
  status: 'ACTIVE' | 'ENDED'
}

export function defaultProfile(): MockUser['profile'] {
  return {
    avatarUrl: null,
    bio: null,
    birthDate: null,
    heightCm: null,
    fitnessGoal: 'GENERAL_FITNESS',
    experienceLevel: 'BEGINNER',
    unitSystem: 'METRIC',
    locale: 'fr',
    notificationsEnabled: true,
  }
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
      profile: defaultProfile(),
    },
    {
      id: 'u-coach',
      email: 'coach@fitcoach.dev',
      firstName: 'Hugo',
      lastName: 'Bernard',
      roles: ['COACH'],
      password: 'Password1',
      profile: defaultProfile(),
    },
    {
      id: 'u-admin',
      email: 'admin@fitcoach.dev',
      firstName: 'Admin',
      lastName: 'FitCoach',
      roles: ['ADMIN', 'COACH'],
      password: 'Password1',
      profile: defaultProfile(),
    },
  ]
}

function seedMuscleGroups(): MuscleGroup[] {
  return [
    { id: 'mg-chest', code: 'CHEST', name: 'Pectoraux' },
    { id: 'mg-back', code: 'BACK', name: 'Dos' },
    { id: 'mg-legs', code: 'LEGS', name: 'Jambes' },
    { id: 'mg-shoulders', code: 'SHOULDERS', name: 'Épaules' },
  ]
}

function seedTags(): Tag[] {
  return [
    { id: 'tag-push', code: 'PUSH', name: 'Poussée' },
    { id: 'tag-pull', code: 'PULL', name: 'Tirage' },
    { id: 'tag-compound', code: 'COMPOUND', name: 'Polyarticulaire' },
  ]
}

function seedExercises(): Exercise[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'ex-1',
      slug: 'developpe-couche',
      name: 'Développé couché',
      description: 'Exercice de base pour les pectoraux.',
      equipment: 'Barre',
      difficulty: 'INTERMEDIATE',
      defaultRestSeconds: 120,
      mediaUrl: null,
      muscles: [
        {
          muscleGroupId: 'mg-chest',
          muscleGroupCode: 'CHEST',
          muscleGroupName: 'Pectoraux',
          role: 'PRIMARY',
        },
      ],
      tags: [{ id: 'tag-push', code: 'PUSH', name: 'Poussée' }],
      alternativeExerciseIds: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ex-2',
      slug: 'squat',
      name: 'Squat',
      description: 'Exercice de base pour les jambes.',
      equipment: 'Barre',
      difficulty: 'INTERMEDIATE',
      defaultRestSeconds: 150,
      mediaUrl: null,
      muscles: [
        {
          muscleGroupId: 'mg-legs',
          muscleGroupCode: 'LEGS',
          muscleGroupName: 'Jambes',
          role: 'PRIMARY',
        },
      ],
      tags: [{ id: 'tag-compound', code: 'COMPOUND', name: 'Polyarticulaire' }],
      alternativeExerciseIds: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ex-3',
      slug: 'traction',
      name: 'Traction',
      description: 'Exercice de tirage au poids du corps.',
      equipment: 'Barre de traction',
      difficulty: 'ADVANCED',
      defaultRestSeconds: 120,
      mediaUrl: null,
      muscles: [
        {
          muscleGroupId: 'mg-back',
          muscleGroupCode: 'BACK',
          muscleGroupName: 'Dos',
          role: 'PRIMARY',
        },
      ],
      tags: [{ id: 'tag-pull', code: 'PULL', name: 'Tirage' }],
      alternativeExerciseIds: [],
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function seedPrograms(): Program[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'prog-1',
      ownerId: 'u-coach',
      ownerName: 'Hugo Bernard',
      title: 'Full body débutant',
      description: 'Programme complet 3x/semaine.',
      category: 'STRENGTH',
      level: 'BEGINNER',
      visibility: 'PUBLIC',
      shareToken: 'share-prog-1',
      averageRating: 4.5,
      ratingsCount: 2,
      mine: false,
      days: [
        {
          id: 'day-1',
          position: 0,
          name: 'Jour 1',
          restDay: false,
          exercises: [
            {
              id: 'pe-1',
              exerciseId: 'ex-1',
              exerciseName: 'Développé couché',
              position: 0,
              sets: 4,
              reps: '8-10',
              restSeconds: 90,
              notes: null,
            },
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function seedScheduledSessions(): ScheduledSession[] {
  return [
    {
      id: 'sched-1',
      title: 'Push day',
      scheduledDate: isoDaysAgo(0),
      status: 'PLANNED',
      programId: 'prog-1',
      programDayId: 'day-1',
      workoutSessionId: null,
      notes: null,
      athleteId: 'u-athlete',
      athleteName: 'Léa Martin',
    },
  ]
}

function seedPosts(): CoachPost[] {
  return [
    {
      id: 'post-1',
      coachId: 'u-coach',
      coachName: 'Hugo Bernard',
      coachAvatarUrl: null,
      content: 'Bienvenue sur mon fil de coaching !',
      imageUrl: null,
      createdAt: isoDaysAgo(2),
      updatedAt: isoDaysAgo(2),
    },
  ]
}

function seedCoachAthletes(): MockCoachAthlete[] {
  return [{ coachId: 'u-coach', athleteId: 'u-athlete', status: 'ACTIVE' }]
}

function seedSessions(): TrainingSession[] {
  const session = (
    id: string,
    title: string,
    daysAgo: number,
    durationMinutes: number,
  ): TrainingSession => ({
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
  muscleGroups: seedMuscleGroups(),
  tags: seedTags(),
  exercises: seedExercises(),
  programs: seedPrograms(),
  scheduledSessions: seedScheduledSessions(),
  posts: seedPosts(),
  coachAthletes: seedCoachAthletes(),
}

export function resetDb() {
  db.users = seedUsers()
  db.sessions = seedSessions()
  db.muscleGroups = seedMuscleGroups()
  db.tags = seedTags()
  db.exercises = seedExercises()
  db.programs = seedPrograms()
  db.scheduledSessions = seedScheduledSessions()
  db.posts = seedPosts()
  db.coachAthletes = seedCoachAthletes()
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
