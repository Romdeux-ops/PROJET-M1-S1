import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as recoveryApi from '../api/recovery-api'
import type {
  BodyWeightRequest,
  RecoveryWorkoutDetailsRequest,
  SleepLogRequest,
} from '../api/recovery-types'

import { recoveryKeys, useRecoveryUserId } from './use-recovery'

function useRecoveryInvalidation() {
  const queryClient = useQueryClient()
  const userId = useRecoveryUserId()

  return () =>
    queryClient.invalidateQueries({
      queryKey: recoveryKeys.user(userId),
    })
}

// Tableau de bord et évaluations

export function useRefreshRecoveryOverview() {
  const queryClient = useQueryClient()
  const userId = useRecoveryUserId()

  return useMutation({
    mutationFn: recoveryApi.refreshRecoveryOverview,

    onSuccess: async (overview) => {
      const overviewKey = recoveryKeys.overview(userId)

      await queryClient.cancelQueries({
        queryKey: overviewKey,
        exact: true,
      })

      queryClient.setQueryData(overviewKey, overview)

      await queryClient.invalidateQueries({
        queryKey: recoveryKeys.user(userId),

        predicate: (query) => query.queryKey[2] !== 'overview',

        refetchType: 'active',
      })
    },

    meta: {
      successMessage: 'Indicateurs de récupération actualisés.',
    },
  })
}

export function useCalculateRecoveryAssessment() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.calculateRecoveryAssessment,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Évaluation calculée.',
    },
  })
}

export function useRecalculateRecoveryAssessments() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.recalculateRecoveryAssessments,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Historique recalculé.',
    },
  })
}

// Paramètres

export function useUpdateRecoverySettings() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.updateRecoverySettings,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Paramètres enregistrés.',
    },
  })
}

// Sommeil

export function useCreateSleepLog() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.createSleepLog,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Sommeil enregistré.',
    },
  })
}

export function useUpdateSleepLog() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: ({ sleepLogId, body }: { sleepLogId: string; body: SleepLogRequest }) =>
      recoveryApi.updateSleepLog(sleepLogId, body),

    onSuccess: invalidate,
    meta: {
      successMessage: 'Sommeil modifié.',
    },
  })
}

export function useDeleteSleepLog() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.deleteSleepLog,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Enregistrement de sommeil supprimé.',
    },
  })
}

// Questionnaires

export function useSaveRecoveryCheckin() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.saveRecoveryCheckin,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Questionnaire quotidien enregistré.',
    },
  })
}

export function useDeleteRecoveryCheckin() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.deleteRecoveryCheckin,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Questionnaire supprimé.',
    },
  })
}

// Détails des entraînements

export function useSaveRecoveryWorkoutDetails() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: ({
      workoutSessionId,
      body,
    }: {
      workoutSessionId: string
      body: RecoveryWorkoutDetailsRequest
    }) => recoveryApi.saveRecoveryWorkoutDetails(workoutSessionId, body),

    onSuccess: invalidate,
    meta: {
      successMessage: 'Informations de la séance enregistrées.',
    },
  })
}

export function useDeleteRecoveryWorkoutDetails() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.deleteRecoveryWorkoutDetails,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Informations complémentaires supprimées.',
    },
  })
}

// Poids

export function useSaveBodyWeight() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: ({ date, body }: { date: string; body: BodyWeightRequest }) =>
      recoveryApi.saveBodyWeight(date, body),

    onSuccess: invalidate,
    meta: {
      successMessage: 'Poids enregistré.',
    },
  })
}

export function useDeleteBodyWeight() {
  const invalidate = useRecoveryInvalidation()

  return useMutation({
    mutationFn: recoveryApi.deleteBodyWeight,
    onSuccess: invalidate,
    meta: {
      successMessage: 'Mesure de poids supprimée.',
    },
  })
}
