import { describe, expect, it } from 'vitest'

import { findImprovedRecords } from './records'
import type { PersonalRecord } from './schemas'

function record(
  exerciseId: string,
  metric: PersonalRecord['metric'],
  value: number,
): PersonalRecord {
  return { exerciseId, exerciseName: exerciseId, metric, value, achievedAt: '2026-11-24T10:00:00Z' }
}

describe('findImprovedRecords', () => {
  const before = [record('squat', 'MAX_WEIGHT', 100), record('squat', 'ESTIMATED_1RM', 120)]

  it('detecte une charge maximale battue', () => {
    const after = [record('squat', 'MAX_WEIGHT', 105), record('squat', 'ESTIMATED_1RM', 125)]
    expect(findImprovedRecords(before, after).map((r) => r.value)).toEqual([105])
  })

  it('detecte un record sur un exercice jamais enregistre', () => {
    const after = [...before, record('bench', 'MAX_WEIGHT', 60)]
    expect(findImprovedRecords(before, after).map((r) => r.exerciseId)).toEqual(['bench'])
  })

  it("ne celebre rien quand les records n'ont pas bouge", () => {
    expect(findImprovedRecords(before, before)).toEqual([])
  })

  it('ne celebre rien sans point de comparaison', () => {
    expect(findImprovedRecords(undefined, before)).toEqual([])
  })

  it('ignore le 1RM estime, qui varie avec la charge', () => {
    const after = [record('squat', 'MAX_WEIGHT', 100), record('squat', 'ESTIMATED_1RM', 130)]
    expect(findImprovedRecords(before, after)).toEqual([])
  })
})
