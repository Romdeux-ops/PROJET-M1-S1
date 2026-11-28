import type { Booking, Slot } from '@/features/booking/schemas'
import type { CoachNote, CoachPost } from '@/features/coaching/schemas'
import type { Exercise, MuscleGroup, Tag } from '@/features/catalog/schemas'
import type { ProfileResponse } from '@/features/identity/schemas'
import type { MatchProfileDetails, MatchSide, SwipeDecision } from '@/features/matching/schemas'
import type { Message } from '@/features/messaging/schemas'
import type { AppNotification } from '@/features/notification/schemas'
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
  status: 'PENDING' | 'REQUESTED' | 'ACTIVE' | 'DECLINED' | 'ENDED'
  invitedAt?: string
}

/** Profil public d'un coach (V16) : invisible tant que `enabled` est faux. */
export interface MockPublicProfile {
  coachId: string
  enabled: boolean
  headline: string | null
  bio: string | null
}

/** Note privee d'un coach ; `coachId` n'est jamais renvoye par l'API. */
export interface MockCoachNote extends CoachNote {
  coachId: string
}

/** Conversation telle que stockee ; le handler en derive la vue de chaque participant. */
export interface MockConversation {
  id: string
  coachId: string
  athleteId: string
  createdAt: string
}

/** Notification telle que stockee ; le handler ne renvoie que celles du destinataire. */
export interface MockNotification extends AppNotification {
  userId: string
}

function seedNotifications(): MockNotification[] {
  const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()
  return [
    {
      id: 'notif-1',
      userId: 'u-athlete',
      type: 'SESSION_REMINDER',
      title: "Séance prévue aujourd'hui",
      body: "« Push day » est au programme aujourd'hui.",
      link: '/planning',
      createdAt: minutesAgo(20),
      readAt: null,
    },
    {
      id: 'notif-2',
      userId: 'u-athlete',
      type: 'SESSION_VALIDATED',
      title: 'Séance validée',
      body: 'Votre coach a validé « Leg day ».',
      link: '/planning',
      createdAt: minutesAgo(26 * 60),
      readAt: minutesAgo(25 * 60),
    },
    {
      id: 'notif-3',
      userId: 'u-coach',
      type: 'SESSION_PENDING_VALIDATION',
      title: 'Séance à valider',
      body: 'Léa Martin a terminé « Pull day » : elle attend votre validation.',
      link: '/coaching',
      createdAt: minutesAgo(45),
      readAt: null,
    },
    {
      id: 'notif-4',
      userId: 'u-coach',
      type: 'BOOKING_CREATED',
      title: 'Nouvelle réservation',
      body: 'Léa Martin a réservé le créneau du 20/01/2026 à 18:30.',
      link: '/booking',
      createdAt: minutesAgo(10),
      readAt: null,
    },
    {
      id: 'notif-5',
      userId: 'u-coach',
      type: 'BOOKING_CANCELLED',
      title: 'Réservation annulée',
      body: 'Léa Martin a annulé la réservation du 18/01/2026 à 10:00.',
      link: '/booking',
      createdAt: minutesAgo(3 * 60),
      readAt: minutesAgo(2 * 60),
    },
    {
      id: 'notif-6',
      userId: 'u-athlete',
      type: 'BOOKING_REMINDER',
      title: 'Rendez-vous demain',
      body: 'Rendez-vous avec Hugo Bernard demain à 18:30.',
      link: '/booking',
      createdAt: minutesAgo(5 * 60),
      readAt: minutesAgo(4 * 60),
    },
  ]
}

/** Profil FitMatch tel que stocke ; prenom, age et taille restent dans l'utilisateur. */
export interface MockMatchProfile extends MatchProfileDetails {
  userId: string
  side: MatchSide
  updatedAt: string
}

export interface MockSwipe {
  swiperId: string
  targetId: string
  decision: SwipeDecision
}

export interface MockMatch {
  id: string
  coachId: string
  athleteId: string
  status: 'ACTIVE' | 'ENDED'
  createdAt: string
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
  return [...seedAccounts(), ...seedFitMatchPeople()]
}

function seedAccounts(): MockUser[] {
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
    {
      id: 'prog-2',
      ownerId: 'u-coach',
      ownerName: 'Hugo Bernard',
      title: 'Prise de masse sur mesure',
      description: 'Programme réservé à mes athlètes.',
      category: 'STRENGTH',
      level: 'INTERMEDIATE',
      visibility: 'CLIENTS',
      shareToken: 'share-prog-2',
      averageRating: 0,
      ratingsCount: 0,
      mine: false,
      days: [
        {
          id: 'day-2',
          position: 0,
          name: 'Haut du corps',
          restDay: false,
          exercises: [],
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
  return [
    { coachId: 'u-coach', athleteId: 'u-athlete', status: 'ACTIVE' },
    // Invitation en attente : visible dans l'espace coaching de l'athlete de demo.
    {
      coachId: 'u-admin',
      athleteId: 'u-athlete',
      status: 'PENDING',
      invitedAt: new Date().toISOString(),
    },
  ]
}

function seedPublicProfiles(): MockPublicProfile[] {
  return [
    {
      coachId: 'u-coach',
      enabled: true,
      headline: 'Préparateur physique · Musculation',
      bio: 'Dix ans à accompagner des débutants comme des compétiteurs.\nMon approche : progresser en sécurité, avec un plan clair et des charges suivies séance après séance.',
    },
  ]
}

function seedCoachNotes(): MockCoachNote[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'note-1',
      coachId: 'u-coach',
      athleteId: 'u-athlete',
      content: 'Reprise après une gêne à l’épaule : charges légères sur le développé.',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

/** Instant ISO dans `days` jours, a `hour` heure locale. */
function inDaysAt(days: number, hour: number, minutes = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minutes, 0, 0)
  return d.toISOString()
}

/**
 * Creneaux du coach de demo, stockes libres : le handler booking derive leur
 * etat reserve de `bookings` (slot-2 est reserve par Lea).
 */
function seedSlots(): Slot[] {
  const slot = (id: string, days: number, hour: number): Slot => ({
    id,
    coachId: 'u-coach',
    coachName: 'Hugo Bernard',
    startsAt: inDaysAt(days, hour),
    endsAt: inDaysAt(days, hour + 1),
    bookingId: null,
    athleteId: null,
    athleteName: null,
    bookingNote: null,
  })
  return [slot('slot-1', 2, 18), slot('slot-2', 3, 10), slot('slot-3', 5, 18)]
}

function seedBookings(): Booking[] {
  const startsAt = inDaysAt(3, 10)
  return [
    {
      id: 'booking-1',
      slotId: 'slot-2',
      coachId: 'u-coach',
      coachName: 'Hugo Bernard',
      athleteId: 'u-athlete',
      athleteName: 'Léa Martin',
      startsAt,
      endsAt: inDaysAt(3, 11),
      status: 'CONFIRMED',
      note: null,
      cancellationDeadline: new Date(new Date(startsAt).getTime() - 24 * 3_600_000).toISOString(),
      cancelledAt: null,
      cancelledBy: null,
    },
  ]
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

function seedConversations(): MockConversation[] {
  return [{ id: 'conv-1', coachId: 'u-coach', athleteId: 'u-athlete', createdAt: hoursAgo(50) }]
}

/** Le dernier message du coach n'est pas encore lu par Lea. */
function seedMessages(): Message[] {
  const message = (
    id: string,
    senderId: string,
    body: string,
    sentHoursAgo: number,
    read: boolean,
  ): Message => ({
    id,
    conversationId: 'conv-1',
    senderId,
    body,
    sentAt: hoursAgo(sentHoursAgo),
    readAt: read ? hoursAgo(sentHoursAgo - 1) : null,
  })
  return [
    message('msg-1', 'u-coach', 'Bienvenue Léa ! Ton programme est prêt.', 48, true),
    message('msg-2', 'u-athlete', 'Merci ! Je commence demain.', 47, true),
    message('msg-3', 'u-coach', 'Pense à noter tes charges à chaque séance.', 2, false),
  ]
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

/** Personnes de demo FitMatch : elles n'ont pas de mot de passe connu, on ne s'y connecte pas. */
function seedFitMatchPeople(): MockUser[] {
  const person = (
    id: string,
    firstName: string,
    lastName: string,
    role: 'ATHLETE' | 'COACH',
    age: number,
    heightCm: number,
    fitnessGoal: MockUser['profile']['fitnessGoal'] = 'GENERAL_FITNESS',
    experienceLevel: MockUser['profile']['experienceLevel'] = 'BEGINNER',
  ): MockUser => ({
    id,
    email: `${id}@fitmatch.demo`,
    firstName,
    lastName,
    roles: [role],
    password: crypto.randomUUID(),
    profile: {
      ...defaultProfile(),
      birthDate: `${new Date().getFullYear() - age}-03-14`,
      heightCm,
      fitnessGoal,
      experienceLevel,
    },
  })
  return [
    person('u-fm-sarah', 'Sarah', 'Lemoine', 'COACH', 31, 168),
    person('u-fm-karim', 'Karim', 'Haddad', 'COACH', 38, 181),
    person('u-fm-julie', 'Julie', 'Roux', 'COACH', 27, 165),
    person('u-fm-thomas', 'Thomas', 'Petit', 'COACH', 44, 178),
    person('u-fm-ines', 'Inès', 'Garcia', 'COACH', 29, 170),
    person('u-fm-nathan', 'Nathan', 'Moreau', 'ATHLETE', 22, 183, 'MUSCLE_GAIN', 'INTERMEDIATE'),
    person('u-fm-chloe', 'Chloé', 'Fournier', 'ATHLETE', 34, 162, 'ENDURANCE', 'BEGINNER'),
    person('u-fm-mehdi', 'Mehdi', 'Benali', 'ATHLETE', 27, 176, 'WEIGHT_LOSS', 'BEGINNER'),
  ]
}

type SeedDetails = Partial<MatchProfileDetails> & Pick<MatchProfileDetails, 'headline' | 'sports'>

function seedMatchProfiles(): MockMatchProfile[] {
  const at = hoursAgo(3)
  const base = (userId: string, side: MatchSide): MockMatchProfile => ({
    userId,
    side,
    headline: '',
    about: null,
    sports: [],
    goals: [],
    levels: [],
    availability: ['EVENING', 'WEEKEND'],
    trainingMode: 'BOTH',
    city: 'Paris',
    maxBudgetEur: side === 'ATHLETE' ? 50 : null,
    sessionRateEur: side === 'COACH' ? 45 : null,
    visible: true,
    updatedAt: at,
  })
  const coach = (userId: string, details: SeedDetails) => ({ ...base(userId, 'COACH'), ...details })
  const athlete = (userId: string, details: SeedDetails) => ({
    ...base(userId, 'ATHLETE'),
    ...details,
  })
  return [
    coach('u-fm-sarah', {
      headline: 'Coach force et remise en forme, je te fais aimer la salle',
      about: 'BPJEPS AF, 8 ans de coaching. Spécialiste des débutants qui veulent se sentir forts.',
      sports: ['STRENGTH', 'HIIT', 'RUNNING'],
      goals: ['GENERAL_FITNESS', 'MUSCLE_GAIN', 'WEIGHT_LOSS'],
      levels: ['BEGINNER', 'INTERMEDIATE'],
      sessionRateEur: 40,
    }),
    coach('u-fm-karim', {
      headline: 'Préparateur running : du premier 10 km au marathon',
      sports: ['RUNNING', 'TRIATHLON', 'CYCLING'],
      goals: ['ENDURANCE'],
      levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      availability: ['MORNING', 'WEEKEND'],
      sessionRateEur: 55,
    }),
    coach('u-fm-julie', {
      headline: 'Yoga et mobilité pour sportifs raides comme des piquets',
      sports: ['YOGA', 'PILATES'],
      availability: ['MORNING', 'NOON'],
      trainingMode: 'REMOTE',
      city: null,
      sessionRateEur: 30,
    }),
    coach('u-fm-thomas', {
      headline: 'Ancien boxeur pro, cardio et confiance en soi garantis',
      sports: ['BOXING', 'MARTIAL_ARTS', 'HIIT'],
      goals: ['WEIGHT_LOSS', 'GENERAL_FITNESS'],
      levels: ['BEGINNER', 'INTERMEDIATE'],
      city: 'Lyon',
      trainingMode: 'ONSITE',
      sessionRateEur: 60,
    }),
    coach('u-fm-ines', {
      headline: 'CrossFit L2 : technique d’haltérophilie et WOD',
      sports: ['CROSSFIT', 'STRENGTH'],
      goals: ['MUSCLE_GAIN'],
      levels: ['INTERMEDIATE', 'ADVANCED'],
      availability: ['EVENING'],
      sessionRateEur: 50,
    }),
    athlete('u-fm-nathan', {
      headline: 'Je veux prendre 5 kg de muscle propre cette année',
      sports: ['STRENGTH', 'CROSSFIT'],
      availability: ['EVENING'],
    }),
    athlete('u-fm-chloe', {
      headline: 'Objectif : finir mon premier semi-marathon',
      sports: ['RUNNING', 'YOGA'],
      availability: ['MORNING', 'WEEKEND'],
      trainingMode: 'REMOTE',
    }),
    athlete('u-fm-mehdi', {
      headline: 'Reprise du sport après 3 ans de canapé',
      sports: ['STRENGTH', 'BOXING', 'HIIT'],
      maxBudgetEur: 35,
    }),
  ]
}

/** Sarah a déjà liké Léa et Nathan a super-liké Hugo : un like en retour suffit pour matcher. */
function seedSwipes(): MockSwipe[] {
  return [
    { swiperId: 'u-fm-sarah', targetId: 'u-athlete', decision: 'LIKE' },
    { swiperId: 'u-fm-nathan', targetId: 'u-coach', decision: 'SUPER_LIKE' },
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
  coachPublicProfiles: seedPublicProfiles(),
  coachNotes: seedCoachNotes(),
  slots: seedSlots(),
  bookings: seedBookings(),
  conversations: seedConversations(),
  messages: seedMessages(),
  notifications: seedNotifications(),
  matchProfiles: seedMatchProfiles(),
  swipes: seedSwipes(),
  matches: [] as MockMatch[],
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
  db.coachPublicProfiles = seedPublicProfiles()
  db.coachNotes = seedCoachNotes()
  db.slots = seedSlots()
  db.bookings = seedBookings()
  db.conversations = seedConversations()
  db.messages = seedMessages()
  db.notifications = seedNotifications()
  db.matchProfiles = seedMatchProfiles()
  db.swipes = seedSwipes()
  db.matches = []
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
