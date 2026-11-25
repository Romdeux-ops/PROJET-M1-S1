import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { announceNewBadges, gamificationApi, gamificationKeys } from '@/features/gamification'
import { useCelebration } from '@/lib/celebration'
import { useSession } from '@/lib/auth/session'

import { trainingApi } from './api/training-api'
import { findImprovedRecords } from './records'
import type { PersonalRecord } from './schemas'

const recordsKey = ['training', 'personal-records'] as const

/** Lit les records tels qu'ils sont avant une serie, pour pouvoir detecter un record battu ensuite. */
export function snapshotRecords(queryClient: QueryClient): Promise<PersonalRecord[] | undefined> {
  return queryClient
    .fetchQuery({ queryKey: recordsKey, queryFn: trainingApi.personalRecords, staleTime: 30_000 })
    .catch(() => undefined)
}

/** Apres une serie ou une seance : celebre un record battu et les nouveaux badges (confettis + notification). */
export async function celebrateProgress(
  queryClient: QueryClient,
  recordsBefore?: PersonalRecord[],
) {
  try {
    const [records, profile] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: recordsKey,
        queryFn: trainingApi.personalRecords,
        staleTime: 0,
      }),
      queryClient.fetchQuery({
        queryKey: gamificationKeys.me(),
        queryFn: gamificationApi.me,
        staleTime: 0,
      }),
    ])

    const improved = findImprovedRecords(recordsBefore, records)
    if (improved.length > 0) {
      const best = improved[0]!
      toast.success('Nouveau record !', { description: `${best.exerciseName} · ${best.value} kg` })
      useCelebration.getState().fire('record')
    }

    const userKey = useSession.getState().user?.id ?? 'anonymous'
    if (announceNewBadges(profile.badges, userKey)) useCelebration.getState().fire('badge')
  } catch {
    // Une celebration manquee ne doit jamais faire echouer l'enregistrement de la serie.
  }
}
