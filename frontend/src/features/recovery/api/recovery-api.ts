import { api, unwrap } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'

import type {
  BodyWeightRequest,
  BodyWeightResponse,
  RecoveryAssessmentResponse,
  RecoveryCheckinRequest,
  RecoveryCheckinResponse,
  RecoveryDateRange,
  RecoveryOverviewResponse,
  RecoverySettingsRequest,
  RecoverySettingsResponse,
  RecoveryTrainingSummaryResponse,
  RecoveryWorkoutDetailsRequest,
  RecoveryWorkoutDetailsResponse,
  RecoveryWorkoutResponse,
  SleepLogRequest,
  SleepLogResponse,
} from './recovery-types'

async function optionalResource<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

// Tableau de bord

export function getRecoveryOverview(): Promise<RecoveryOverviewResponse> {
  return unwrap(api.GET('/api/recovery/overview'))
}

export function refreshRecoveryOverview(): Promise<RecoveryOverviewResponse> {
  return unwrap(api.POST('/api/recovery/overview/refresh'))
}

// Évaluations

export function getRecoveryAssessments(
  range: RecoveryDateRange,
): Promise<RecoveryAssessmentResponse[]> {
  return unwrap(
    api.GET('/api/recovery/assessments', {
      params: { query: range },
    }),
  )
}

export function getRecoveryAssessment(date: string): Promise<RecoveryAssessmentResponse | null> {
  return optionalResource(
    unwrap(
      api.GET('/api/recovery/assessments/{date}', {
        params: { path: { date } },
      }),
    ),
  )
}

export function getTodayRecoveryAssessment(): Promise<RecoveryAssessmentResponse | null> {
  return optionalResource(unwrap(api.GET('/api/recovery/assessments/today')))
}

export function calculateRecoveryAssessment(date: string): Promise<RecoveryAssessmentResponse> {
  return unwrap(
    api.POST('/api/recovery/assessments/{date}/calculate', {
      params: { path: { date } },
    }),
  )
}

export function recalculateRecoveryAssessments(
  range: RecoveryDateRange,
): Promise<RecoveryAssessmentResponse[]> {
  return unwrap(
    api.POST('/api/recovery/assessments/recalculate', {
      params: { query: range },
    }),
  )
}

// Paramètres

export function getRecoverySettings(): Promise<RecoverySettingsResponse> {
  return unwrap(api.GET('/api/recovery/settings'))
}

export function updateRecoverySettings(
  body: RecoverySettingsRequest,
): Promise<RecoverySettingsResponse> {
  return unwrap(api.PUT('/api/recovery/settings', { body }))
}

// Sommeil

export function getSleepLogs(range: RecoveryDateRange): Promise<SleepLogResponse[]> {
  return unwrap(
    api.GET('/api/recovery/sleep', {
      params: { query: range },
    }),
  )
}

export function getSleepLog(sleepLogId: string): Promise<SleepLogResponse> {
  return unwrap(
    api.GET('/api/recovery/sleep/{sleepLogId}', {
      params: { path: { sleepLogId } },
    }),
  )
}

export function createSleepLog(body: SleepLogRequest): Promise<SleepLogResponse> {
  return unwrap(api.POST('/api/recovery/sleep', { body }))
}

export function updateSleepLog(
  sleepLogId: string,
  body: SleepLogRequest,
): Promise<SleepLogResponse> {
  return unwrap(
    api.PUT('/api/recovery/sleep/{sleepLogId}', {
      params: { path: { sleepLogId } },
      body,
    }),
  )
}

export async function deleteSleepLog(sleepLogId: string): Promise<void> {
  await unwrap(
    api.DELETE('/api/recovery/sleep/{sleepLogId}', {
      params: { path: { sleepLogId } },
    }),
  )
}

// Questionnaires quotidiens

export function getRecoveryCheckins(range: RecoveryDateRange): Promise<RecoveryCheckinResponse[]> {
  return unwrap(
    api.GET('/api/recovery/checkins', {
      params: { query: range },
    }),
  )
}

export function getRecoveryCheckin(date: string): Promise<RecoveryCheckinResponse | null> {
  return optionalResource(
    unwrap(
      api.GET('/api/recovery/checkins/{date}', {
        params: { path: { date } },
      }),
    ),
  )
}

export function saveRecoveryCheckin(
  body: RecoveryCheckinRequest,
): Promise<RecoveryCheckinResponse> {
  return unwrap(api.PUT('/api/recovery/checkins', { body }))
}

export async function deleteRecoveryCheckin(date: string): Promise<void> {
  await unwrap(
    api.DELETE('/api/recovery/checkins/{date}', {
      params: { path: { date } },
    }),
  )
}

// Entraînements

export function getRecoveryWorkouts(range: RecoveryDateRange): Promise<RecoveryWorkoutResponse[]> {
  return unwrap(
    api.GET('/api/recovery/training/workouts', {
      params: { query: range },
    }),
  )
}

export function getRecoveryWorkout(workoutSessionId: string): Promise<RecoveryWorkoutResponse> {
  return unwrap(
    api.GET('/api/recovery/training/workouts/{workoutSessionId}', {
      params: { path: { workoutSessionId } },
    }),
  )
}

export function getRecoveryDailySummaries(
  range: RecoveryDateRange,
): Promise<RecoveryTrainingSummaryResponse[]> {
  return unwrap(
    api.GET('/api/recovery/training/daily', {
      params: { query: range },
    }),
  )
}

export function getRecoveryDailySummary(date: string): Promise<RecoveryTrainingSummaryResponse> {
  return unwrap(
    api.GET('/api/recovery/training/daily/{date}', {
      params: { path: { date } },
    }),
  )
}

export function getRecoveryWorkoutDetails(
  workoutSessionId: string,
): Promise<RecoveryWorkoutDetailsResponse | null> {
  return optionalResource(
    unwrap(
      api.GET('/api/recovery/training/workouts/{workoutSessionId}/details', {
        params: { path: { workoutSessionId } },
      }),
    ),
  )
}

export function saveRecoveryWorkoutDetails(
  workoutSessionId: string,
  body: RecoveryWorkoutDetailsRequest,
): Promise<RecoveryWorkoutDetailsResponse> {
  return unwrap(
    api.PUT('/api/recovery/training/workouts/{workoutSessionId}/details', {
      params: { path: { workoutSessionId } },
      body,
    }),
  )
}

export async function deleteRecoveryWorkoutDetails(workoutSessionId: string): Promise<void> {
  await unwrap(
    api.DELETE('/api/recovery/training/workouts/{workoutSessionId}/details', {
      params: { path: { workoutSessionId } },
    }),
  )
}

// Historique du poids — API publique Identity

export function getBodyWeightHistory(range: RecoveryDateRange): Promise<BodyWeightResponse[]> {
  return unwrap(
    api.GET('/api/users/me/profile/weight', {
      params: { query: range },
    }),
  )
}

export function saveBodyWeight(date: string, body: BodyWeightRequest): Promise<BodyWeightResponse> {
  return unwrap(
    api.PUT('/api/users/me/profile/weight/{date}', {
      params: { path: { date } },
      body,
    }),
  )
}

export async function deleteBodyWeight(date: string): Promise<void> {
  await unwrap(
    api.DELETE('/api/users/me/profile/weight/{date}', {
      params: { path: { date } },
    }),
  )
}
