import { api, unwrap } from '@/lib/api/client'
import type { SessionUser } from '@/lib/auth/session'

import type { LoginInput, RegisterInput } from '../schemas'

/**
 * Contrat du module identity (backend) :
 *   POST /api/auth/login     { email, password }            -> AuthResponse
 *   POST /api/auth/register  { firstName, lastName, email, password, role } -> AuthResponse
 *   GET  /api/users/me                                       -> SessionUser
 */
export interface AuthResponse {
  accessToken: string
  user: SessionUser
}

export const authApi = {
  login: (input: LoginInput) =>
    unwrap(api.POST('/api/auth/login', { body: input })) as Promise<AuthResponse>,
  register: ({ confirmPassword: _, ...input }: RegisterInput) =>
    unwrap(api.POST('/api/auth/register', { body: input })) as Promise<AuthResponse>,
  me: () => unwrap(api.GET('/api/users/me')) as Promise<SessionUser>,
}
