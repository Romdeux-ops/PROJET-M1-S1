import { http, HttpResponse } from 'msw'

import type {
  Candidate,
  Match,
  MatchProfileFormValues,
  MatchSide,
  MyMatchProfile,
  SwipeDecision,
  SwipeResult,
} from '@/features/matching/schemas'

import { db, type MockMatch, type MockMatchProfile, type MockUser, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

const MINIMUM_AGE = 16

function ageOf(birthDate: string | null) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age -= 1
  }
  return age
}

function sideOf(user: MockUser): MatchSide {
  return user.roles.includes('COACH') ? 'COACH' : 'ATHLETE'
}

const profileOf = (userId: string) => db.matchProfiles.find((p) => p.userId === userId)
const userOf = (userId: string) => db.users.find((u) => u.id === userId)

function toMyProfile(user: MockUser): MyMatchProfile {
  const profile = profileOf(user.id)
  const missing: MyMatchProfile['missing'] = []
  if (!user.profile.birthDate) missing.push('BIRTH_DATE')
  if (user.profile.heightCm === null) missing.push('HEIGHT')
  return {
    side: profile?.side ?? sideOf(user),
    firstName: user.firstName,
    avatarUrl: user.avatarUrl ?? null,
    birthDate: user.profile.birthDate,
    age: ageOf(user.profile.birthDate),
    heightCm: user.profile.heightCm,
    fitnessGoal: user.profile.fitnessGoal,
    experienceLevel: user.profile.experienceLevel,
    missing,
    profile: profile
      ? {
          headline: profile.headline,
          about: profile.about,
          sports: profile.sports,
          goals: profile.goals,
          levels: profile.levels,
          availability: profile.availability,
          trainingMode: profile.trainingMode,
          city: profile.city,
          maxBudgetEur: profile.maxBudgetEur,
          sessionRateEur: profile.sessionRateEur,
          visible: profile.visible,
        }
      : null,
  }
}

/** Meme bareme que `Compatibility` cote backend. */
function compatibility(athlete: MockMatchProfile, athleteUser: MockUser, coach: MockMatchProfile) {
  let score = 0
  const reasons: string[] = []
  const shared = <T>(a: T[], b: T[]) => a.filter((v) => b.includes(v)).length

  const sports = shared(athlete.sports, coach.sports)
  if (sports > 0) {
    score += sports >= 2 ? 30 : 20
    reasons.push('SHARED_SPORTS')
  }
  if (coach.goals.includes(athleteUser.profile.fitnessGoal)) {
    score += 20
    reasons.push('GOAL_SUPPORTED')
  } else if (coach.goals.length === 0) score += 10
  if (coach.levels.includes(athleteUser.profile.experienceLevel)) {
    score += 10
    reasons.push('LEVEL_SUPPORTED')
  } else if (coach.levels.length === 0) score += 5

  const slots = shared(athlete.availability, coach.availability)
  if (slots > 0) {
    score += Math.round((15 * slots) / athlete.availability.length)
    reasons.push('SHARED_AVAILABILITY')
  }

  const onsite = (p: MockMatchProfile) => p.trainingMode !== 'REMOTE'
  const remote = (p: MockMatchProfile) => p.trainingMode !== 'ONSITE'
  const sameCity =
    !!athlete.city &&
    !!coach.city &&
    athlete.city.trim().toLowerCase() === coach.city.trim().toLowerCase()
  if (onsite(athlete) && onsite(coach) && sameCity) {
    score += 15
    reasons.push('SAME_CITY')
  } else if (remote(athlete) && remote(coach)) {
    score += 10
    reasons.push('REMOTE_POSSIBLE')
  }

  if (athlete.maxBudgetEur === null || coach.sessionRateEur === null) score += 5
  else if (coach.sessionRateEur <= athlete.maxBudgetEur) {
    score += 10
    reasons.push('WITHIN_BUDGET')
  }
  return { score: Math.min(score, 100), reasons }
}

function toCandidate(
  viewer: MockUser,
  me: MockMatchProfile,
  candidate: MockMatchProfile,
): Candidate {
  const user = userOf(candidate.userId)!
  const { score, reasons } =
    me.side === 'ATHLETE'
      ? compatibility(me, viewer, candidate)
      : compatibility(candidate, user, me)
  const coach = candidate.side === 'COACH'
  return {
    userId: candidate.userId,
    side: candidate.side,
    firstName: user.firstName,
    age: ageOf(user.profile.birthDate),
    heightCm: user.profile.heightCm,
    avatarUrl: user.avatarUrl ?? null,
    headline: candidate.headline,
    about: candidate.about,
    sports: candidate.sports,
    goals: coach ? candidate.goals : [user.profile.fitnessGoal],
    levels: coach ? candidate.levels : [user.profile.experienceLevel],
    availability: candidate.availability,
    trainingMode: candidate.trainingMode,
    city: candidate.city,
    sessionRateEur: coach ? candidate.sessionRateEur : null,
    score,
    reasons,
    superLikedYou: db.swipes.some(
      (s) =>
        s.swiperId === candidate.userId && s.targetId === viewer.id && s.decision === 'SUPER_LIKE',
    ),
  }
}

function toMatch(viewerId: string, match: MockMatch): Match {
  const counterpartId = match.coachId === viewerId ? match.athleteId : match.coachId
  const user = userOf(counterpartId)
  const profile = profileOf(counterpartId)
  return {
    id: match.id,
    counterpartId,
    counterpartSide: match.coachId === viewerId ? 'ATHLETE' : 'COACH',
    counterpartFirstName: user?.firstName ?? '',
    counterpartAge: ageOf(user?.profile.birthDate ?? null),
    counterpartAvatarUrl: user?.avatarUrl ?? null,
    counterpartHeadline: profile?.headline ?? null,
    counterpartSports: profile?.sports ?? [],
    createdAt: match.createdAt,
  }
}

const liked = (swiperId: string, targetId: string) =>
  db.swipes.some((s) => s.swiperId === swiperId && s.targetId === targetId && s.decision !== 'PASS')

export const matchingHandlers = [
  http.get('*/api/matching/profile', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    return HttpResponse.json(toMyProfile(user))
  }),

  http.put<never, MatchProfileFormValues>('*/api/matching/profile', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const body = await request.json()

    const birthDate = body.birthDate || user.profile.birthDate
    const age = ageOf(birthDate)
    if (age === null || age < MINIMUM_AGE) {
      return problem(400, `FitMatch est réservé aux personnes de ${MINIMUM_AGE} ans ou plus.`)
    }
    user.profile.birthDate = birthDate
    if (body.heightCm !== undefined && body.heightCm !== null) user.profile.heightCm = body.heightCm

    const existing = profileOf(user.id)
    const side = existing?.side ?? sideOf(user)
    const coach = side === 'COACH'
    const unique = <T>(values: T[] | undefined) => [...new Set(values ?? [])]
    const profile: MockMatchProfile = {
      userId: user.id,
      side,
      headline: body.headline.trim(),
      about: body.about?.trim() || null,
      sports: unique(body.sports),
      goals: coach ? unique(body.goals) : [],
      levels: coach ? unique(body.levels) : [],
      availability: unique(body.availability),
      trainingMode: body.trainingMode,
      city: body.city?.trim() || null,
      maxBudgetEur: coach ? null : (body.maxBudgetEur ?? null),
      sessionRateEur: coach ? (body.sessionRateEur ?? null) : null,
      visible: body.visible ?? true,
      updatedAt: new Date().toISOString(),
    }
    db.matchProfiles = [...db.matchProfiles.filter((p) => p.userId !== user.id), profile]
    return HttpResponse.json(toMyProfile(user))
  }),

  http.get('*/api/matching/feed', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const me = profileOf(user.id)
    if (!me) return problem(409, "Créez d'abord votre profil FitMatch.")
    const limit = Math.min(
      Math.max(Number(new URL(request.url).searchParams.get('limit') ?? 20), 1),
      50,
    )

    const candidates = db.matchProfiles
      .filter(
        (p) =>
          p.side !== me.side &&
          p.visible &&
          p.userId !== user.id &&
          userOf(p.userId) &&
          !db.swipes.some((s) => s.swiperId === user.id && s.targetId === p.userId) &&
          !db.swipes.some(
            (s) => s.swiperId === p.userId && s.targetId === user.id && s.decision === 'PASS',
          ),
      )
      .map((p) => toCandidate(user, me, p))
      .sort((a, b) => Number(b.superLikedYou) - Number(a.superLikedYou) || b.score - a.score)
      .slice(0, limit)
    return HttpResponse.json(candidates)
  }),

  http.post<never, { targetId: string; decision: SwipeDecision }>(
    '*/api/matching/swipes',
    async ({ request }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const me = profileOf(user.id)
      if (!me) return problem(409, "Créez d'abord votre profil FitMatch.")
      const { targetId, decision } = await request.json()
      if (targetId === user.id) return problem(400, 'Choix invalide.')
      const target = profileOf(targetId)
      if (!target || !target.visible) return problem(404, 'Profil FitMatch introuvable.')
      if (target.side === me.side) {
        return problem(400, "Un athlète ne peut swiper qu'un coach, et un coach qu'un athlète.")
      }

      db.swipes = [
        ...db.swipes.filter((s) => !(s.swiperId === user.id && s.targetId === targetId)),
        { swiperId: user.id, targetId, decision },
      ]
      const coachId = me.side === 'COACH' ? user.id : targetId
      const athleteId = me.side === 'COACH' ? targetId : user.id
      let existing = db.matches.find((m) => m.coachId === coachId && m.athleteId === athleteId)
      let newMatch = false
      if (decision !== 'PASS' && liked(targetId, user.id) && !existing) {
        existing = {
          id: crypto.randomUUID(),
          coachId,
          athleteId,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        }
        db.matches.push(existing)
        newMatch = true
      }
      const result: SwipeResult = {
        decision,
        match: existing?.status === 'ACTIVE' ? toMatch(user.id, existing) : null,
        newMatch,
      }
      return HttpResponse.json(result)
    },
  ),

  http.get('*/api/matching/matches', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    return HttpResponse.json(
      db.matches
        .filter((m) => m.status === 'ACTIVE' && (m.coachId === user.id || m.athleteId === user.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((m) => toMatch(user.id, m)),
    )
  }),

  http.delete<{ matchId: string }>(
    '*/api/matching/matches/:matchId',
    async ({ request, params }) => {
      await networkDelay()
      const user = userFromRequest(request)
      if (!user) return problem(401, 'Session invalide.')
      const match = db.matches.find(
        (m) =>
          m.id === params.matchId &&
          m.status === 'ACTIVE' &&
          (m.coachId === user.id || m.athleteId === user.id),
      )
      if (!match) return problem(404, 'Match introuvable.')
      match.status = 'ENDED'
      return new HttpResponse(null, { status: 204 })
    },
  ),
]
