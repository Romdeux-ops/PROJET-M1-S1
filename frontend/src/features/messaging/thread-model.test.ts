import { describe, expect, it } from 'vitest'

import type { Message } from './schemas'
import { buildThreadRows, dayLabel, listTimestamp } from './thread-model'

function message(id: string, senderId: string, sentAt: string): Message {
  return { id, conversationId: 'c', senderId, body: id, sentAt, readAt: null }
}

describe('buildThreadRows', () => {
  const me = 'me'

  it('ajoute un separateur a chaque nouveau jour', () => {
    const rows = buildThreadRows(
      [
        message('a', me, '2026-11-17T10:00:00'),
        message('b', me, '2026-11-17T10:01:00'),
        message('c', me, '2026-11-18T09:00:00'),
      ],
      me,
    )
    expect(rows.filter((r) => r.type === 'day')).toHaveLength(2)
  })

  it('regroupe les messages proches du meme auteur', () => {
    const rows = buildThreadRows(
      [
        message('a', me, '2026-11-17T10:00:00'),
        message('b', me, '2026-11-17T10:02:00'),
        message('c', me, '2026-11-17T10:03:00'),
      ],
      me,
    ).filter((r) => r.type === 'message')
    expect(rows.map((r) => [r.first, r.last])).toEqual([
      [true, false],
      [false, false],
      [false, true],
    ])
  })

  it("coupe le groupe quand l'auteur change ou apres cinq minutes", () => {
    const rows = buildThreadRows(
      [
        message('a', me, '2026-11-17T10:00:00'),
        message('b', 'coach', '2026-11-17T10:01:00'),
        message('c', 'coach', '2026-11-17T10:30:00'),
      ],
      me,
    ).filter((r) => r.type === 'message')
    expect(rows.map((r) => [r.first, r.last, r.mine])).toEqual([
      [true, true, true],
      [true, true, false],
      [true, true, false],
    ])
  })
})

describe('libelles de date', () => {
  const now = new Date('2026-11-24T15:00:00')

  it('nomme aujourd’hui et hier', () => {
    expect(dayLabel('2026-11-24T08:00:00', now)).toBe("Aujourd'hui")
    expect(dayLabel('2026-11-23T08:00:00', now)).toBe('Hier')
  })

  it('ecrit la date complete pour les jours plus anciens', () => {
    expect(dayLabel('2026-11-17T08:00:00', now)).toBe('Mardi 17 novembre')
    expect(dayLabel('2025-12-25T08:00:00', now)).toContain('2025')
  })

  it("affiche l'heure aujourd'hui, Hier, le jour puis la date dans la liste", () => {
    expect(listTimestamp('2026-11-24T08:05:00', now)).toBe('08:05')
    expect(listTimestamp('2026-11-23T08:05:00', now)).toBe('Hier')
    expect(listTimestamp('2026-11-20T08:05:00', now)).toBe('Ven')
    expect(listTimestamp('2026-10-02T08:05:00', now)).toMatch(/^2 oct/)
  })
})
