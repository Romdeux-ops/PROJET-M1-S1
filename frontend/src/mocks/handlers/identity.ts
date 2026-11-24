import { http, HttpResponse } from 'msw'

import type { AuthResponse } from '@/features/identity'
import type { ProfileResponse, UpdateProfileInput } from '@/features/identity/schemas'
import type { Role } from '@/lib/auth/session'

import { db, defaultProfile, tokenFor, toSessionUser, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

function toProfileResponse(user: (typeof db.users)[number]): ProfileResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    ...user.profile,
  }
}

interface RegisterBody {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
}

export const identityHandlers = [
  http.post<never, { email: string; password: string }>('*/api/auth/login', async ({ request }) => {
    await networkDelay()
    const { email, password } = await request.json()
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || user.password !== password)
      return problem(401, 'E-mail ou mot de passe incorrect.', { challenge: false })
    return HttpResponse.json<AuthResponse>({
      accessToken: tokenFor(user.id),
      user: toSessionUser(user),
    })
  }),

  http.post<never, RegisterBody>('*/api/auth/register', async ({ request }) => {
    await networkDelay()
    const body = await request.json()
    if (db.users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
      return problem(409, 'Un compte existe déjà avec cette adresse e-mail.')
    }
    const user = {
      id: crypto.randomUUID(),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      roles: [body.role],
      password: body.password,
      profile: defaultProfile(),
    }
    db.users.push(user)
    return HttpResponse.json<AuthResponse>(
      { accessToken: tokenFor(user.id), user: toSessionUser(user) },
      { status: 201 },
    )
  }),

  http.get('*/api/users/me', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    return HttpResponse.json(toSessionUser(user))
  }),

  http.get('*/api/users/me/profile', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    return HttpResponse.json(toProfileResponse(user))
  }),

  http.patch<never, UpdateProfileInput>('*/api/users/me/profile', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    const body = await request.json()
    user.firstName = body.firstName
    user.lastName = body.lastName
    user.profile = {
      ...user.profile,
      bio: body.bio || null,
      fitnessGoal: body.fitnessGoal,
      experienceLevel: body.experienceLevel,
      unitSystem: body.unitSystem,
      locale: body.locale,
      notificationsEnabled: body.notificationsEnabled,
    }
    return HttpResponse.json(toProfileResponse(user))
  }),

  http.post('*/api/users/me/profile/avatar', async ({ request }) => {
    await networkDelay()
    const user = userFromRequest(request)
    if (!user) return problem(401, 'Session invalide.')
    user.profile = { ...user.profile, avatarUrl: '/uploads/avatars/mock-avatar.jpg' }
    return HttpResponse.json({ avatarUrl: user.profile.avatarUrl }, { status: 201 })
  }),
]
