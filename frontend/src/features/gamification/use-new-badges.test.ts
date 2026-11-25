import { describe, expect, it } from 'vitest'

import type { Badge } from './schemas'
import { findNewBadges } from './use-new-badges'

function badge(id: string, awardedAt: string | null): Badge {
  return { id, code: id, name: id, description: '', awardedAt } as Badge
}

describe('findNewBadges', () => {
  const badges = [
    badge('a', '2026-11-01T10:00:00Z'),
    badge('b', '2026-11-02T10:00:00Z'),
    badge('c', null),
  ]

  it('ne celebre que les badges obtenus et pas encore vus', () => {
    expect(findNewBadges(badges, ['a']).map((b) => b.id)).toEqual(['b'])
  })

  it('ignore les badges verrouilles', () => {
    expect(findNewBadges(badges, []).map((b) => b.id)).toEqual(['a', 'b'])
  })

  it('ne renvoie rien quand tout a deja ete vu', () => {
    expect(findNewBadges(badges, ['a', 'b'])).toEqual([])
  })
})
