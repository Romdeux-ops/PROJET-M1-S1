import { redirect } from '@tanstack/react-router'

import { hasRole, isAuthenticated, type Role, useSession } from './session'

/** `beforeLoad` des routes protegees : redirige vers /login en conservant la cible. */
export function requireAuth({ location }: { location: { href: string } }) {
  if (!isAuthenticated()) {
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
}

/** `beforeLoad` des routes reservees a certains roles. */
export function requireRole(...roles: Role[]) {
  return () => {
    if (!hasRole(useSession.getState().user, ...roles)) {
      throw redirect({ to: '/dashboard' })
    }
  }
}

/** `beforeLoad` des pages publiques (login, inscription) : inutile si deja connecte. */
export function redirectIfAuthenticated() {
  if (isAuthenticated()) throw redirect({ to: '/dashboard' })
}
