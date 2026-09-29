import { http, HttpResponse } from 'msw'

import type { AuthResponse } from '@/features/identity'
import type { Role } from '@/lib/auth/session'

import { db, tokenFor, toSessionUser, userFromRequest } from '../db'
import { networkDelay, problem } from '../utils'

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
      return problem(401, 'E-mail ou mot de passe incorrect.')
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
]
