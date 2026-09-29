import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'ATHLETE' | 'COACH' | 'ADMIN'

export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: Role[]
  avatarUrl?: string | null
}

interface SessionState {
  token: string | null
  user: SessionUser | null
  setSession: (token: string, user: SessionUser) => void
  setUser: (user: SessionUser) => void
  logout: () => void
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'fitcoach-session' },
  ),
)

export function isAuthenticated() {
  return Boolean(useSession.getState().token)
}

export function hasRole(user: SessionUser | null | undefined, ...roles: Role[]) {
  if (!user) return false
  if (roles.length === 0) return true
  return roles.some((role) => user.roles.includes(role))
}

export function useHasRole(...roles: Role[]) {
  const user = useSession((s) => s.user)
  return hasRole(user, ...roles)
}

export const ROLE_LABELS: Record<Role, string> = {
  ATHLETE: 'Athlète',
  COACH: 'Coach',
  ADMIN: 'Administrateur',
}
