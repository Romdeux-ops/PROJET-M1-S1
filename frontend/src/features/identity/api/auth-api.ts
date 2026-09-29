import { http } from '@/lib/api/client'
import type { SessionUser } from '@/lib/auth/session'

import type { LoginInput, RegisterInput } from '../schemas'

/**
 * Contrat attendu du module identity (backend) :
 *   POST /api/auth/login     { email, password }            -> AuthResponse
 *   POST /api/auth/register  { firstName, lastName, email, password, role } -> AuthResponse
 *   GET  /api/users/me                                       -> SessionUser
 */
export interface AuthResponse {
  accessToken: string
  user: SessionUser
}

export const authApi = {
  login: (input: LoginInput) => http.post<AuthResponse>('/api/auth/login', input),
  register: ({ confirmPassword: _, ...input }: RegisterInput) =>
    http.post<AuthResponse>('/api/auth/register', input),
  me: () => http.get<SessionUser>('/api/users/me'),
}
