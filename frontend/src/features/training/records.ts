import type { PersonalRecord } from './schemas'

/** Records de charge maximale nouveaux ou battus entre deux lectures (jamais le 1RM, qui varie avec la charge). */
export function findImprovedRecords(
  before: PersonalRecord[] | undefined,
  after: PersonalRecord[],
): PersonalRecord[] {
  if (!before) return []
  const key = (r: PersonalRecord) => `${r.exerciseId}:${r.metric}`
  const previous = new Map(before.map((r) => [key(r), r.value]))
  return after.filter((r) => r.metric === 'MAX_WEIGHT' && (previous.get(key(r)) ?? 0) < r.value)
}
