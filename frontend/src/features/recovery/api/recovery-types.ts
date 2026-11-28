import type { components } from '@/lib/api/schema'

type Schemas = components['schemas']

type NullableResponse<T> = T extends (infer Item)[]
  ? NullableResponse<Item>[]
  : T extends object
    ? { [K in keyof T]: NullableResponse<T[K]> | null }
    : T

// Requêtes

export type SleepLogRequest = Schemas['SleepLogRequest']
export type RecoveryCheckinRequest = Schemas['RecoveryCheckinRequest']
export type RecoverySettingsRequest = Schemas['RecoverySettingsRequest']
export type RecoveryWorkoutDetailsRequest = Schemas['RecoveryWorkoutDetailsRequest']
export type BodyWeightRequest = Schemas['BodyWeightRequest']

// Réponses

export type SleepLogResponse = NullableResponse<Schemas['SleepLogResponse']>

export type RecoveryCheckinResponse = NullableResponse<Schemas['RecoveryCheckinResponse']>

export type RecoverySettingsResponse = NullableResponse<Schemas['RecoverySettingsResponse']>

export type RecoveryWorkoutDetailsResponse = NullableResponse<
  Schemas['RecoveryWorkoutDetailsResponse']
>

export type RecoveryAssessmentResponse = NullableResponse<Schemas['RecoveryAssessmentResponse']>

export type RecoveryWorkoutResponse = NullableResponse<Schemas['RecoveryWorkoutResponse']>

export type RecoveryTrainingSummaryResponse = NullableResponse<
  Schemas['RecoveryTrainingSummaryResponse']
>

export type RecoveryOverviewResponse = NullableResponse<Schemas['RecoveryOverviewResponse']>

export type RecoveryDailyTrendResponse = NullableResponse<Schemas['RecoveryDailyTrendResponse']>

export type RecoveryWeeklySummaryResponse = NullableResponse<
  Schemas['RecoveryWeeklySummaryResponse']
>

export type RecoveryPlanningSummaryResponse = NullableResponse<
  Schemas['RecoveryPlanningSummaryResponse']
>

export type RecoveryWeightSummaryResponse = NullableResponse<
  Schemas['RecoveryWeightSummaryResponse']
>

export type BodyWeightResponse = NullableResponse<Schemas['BodyWeightResponse']>

// Types métier

export type ActivityType = NonNullable<RecoveryWorkoutDetailsRequest['activityType']>

export type RecoveryDataStatus = NonNullable<RecoveryAssessmentResponse['dataStatus']>

export type RecoveryRecommendation = NonNullable<RecoveryAssessmentResponse['recommendation']>

export interface RecoveryDateRange {
  from: string
  to: string
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  STRENGTH: 'Musculation',
  CARDIO: 'Cardio',
  HIIT: 'HIIT',
  RUNNING: 'Course à pied',
  CYCLING: 'Cyclisme',
  WALKING: 'Marche',
  SWIMMING: 'Natation',
  YOGA: 'Yoga',
  STRETCHING: 'Étirements',
  OTHER: 'Autre activité',
}

export const DATA_STATUS_LABELS: Record<RecoveryDataStatus, string> = {
  COMPLETE: 'Données complètes',
  PARTIAL: 'Données partielles',
  INSUFFICIENT: 'Données insuffisantes',
}

export const RECOMMENDATION_LABELS: Record<RecoveryRecommendation, string> = {
  NORMAL_TRAINING: 'Entraînement habituel',
  MODERATE_TRAINING: 'Entraînement modéré',
  LIGHT_ACTIVITY: 'Activité légère',
  REST: 'Repos conseillé',
}
