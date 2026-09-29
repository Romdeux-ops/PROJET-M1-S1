import { useMemo } from 'react'

import { NAVIGATION } from '@/features/navigation'
import { hasRole, useSession } from '@/lib/auth/session'

export function useVisibleNavigation() {
  const user = useSession((s) => s.user)
  return useMemo(
    () =>
      NAVIGATION.map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.roles || hasRole(user, ...item.roles)),
      })).filter((group) => group.items.length > 0),
    [user],
  )
}
