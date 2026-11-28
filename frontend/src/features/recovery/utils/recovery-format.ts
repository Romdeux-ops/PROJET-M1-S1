import { formatNumber, formatDuration } from '@/lib/format'

export type ScoreKind = 'bodyBattery' | 'sleepScore' | 'trainingReadiness'

export const SCORE_COLORS: Record<ScoreKind, string> = {
  bodyBattery: '#3b82f6',
  sleepScore: '#8b5cf6',
  trainingReadiness: '#22c55e',
}

export const SCORE_LABELS: Record<ScoreKind, string> = {
  bodyBattery: 'Body Battery',
  sleepScore: 'Sleep Score',
  trainingReadiness: 'Training Readiness',
}

export function isAvailable(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function normalizeScore(value: number | null | undefined): number | null {
  if (!isAvailable(value)) return null

  return Math.max(0, Math.min(100, Math.round(value)))
}

export function formatRecoveryNumber(
  value: number | null | undefined,
  unit = '',
  decimals = 1,
): string {
  if (!isAvailable(value)) return '—'

  const rounded = Number(value.toFixed(decimals))

  return `${formatNumber(rounded)}${unit ? ` ${unit}` : ''}`
}

export function formatRecoveryDuration(minutes: number | null | undefined): string {
  if (!isAvailable(minutes) || minutes < 0) return '—'

  return formatDuration(Math.round(minutes))
}

export function formatRecoveryPercentage(value: number | null | undefined): string {
  return formatRecoveryNumber(value, '%')
}

export function formatRecoveryWeight(value: number | null | undefined): string {
  return formatRecoveryNumber(value, 'kg', 2)
}

export function formatRecoveryWeightChange(value: number | null | undefined): string {
  if (!isAvailable(value)) return '—'

  const rounded = Number(value.toFixed(2))
  const prefix = rounded > 0 ? '+' : ''

  return `${prefix}${formatNumber(rounded)} kg`
}

export function getScoreLabel(kind: ScoreKind, value: number | null | undefined): string {
  const score = normalizeScore(value)

  if (score === null) return 'Données insuffisantes'

  switch (kind) {
    case 'bodyBattery':
      if (score >= 80) return 'Énergie très élevée'
      if (score >= 60) return 'Énergie élevée'
      if (score >= 40) return 'Énergie modérée'
      if (score >= 20) return 'Énergie faible'
      return 'Énergie très faible'

    case 'sleepScore':
      if (score >= 90) return 'Excellent'
      if (score >= 75) return 'Bon'
      if (score >= 50) return 'Moyen'
      if (score >= 30) return 'Faible'
      return 'Très faible'

    case 'trainingReadiness':
      if (score >= 90) return 'Excellente'
      if (score >= 75) return 'Bonne'
      if (score >= 50) return 'Modérée'
      if (score >= 30) return 'Faible'
      return 'Très faible'
  }
}

export function formatRecoveryChartDate(value: string): string {
  const date = new Date(`${value}T12:00:00`)

  if (!Number.isFinite(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function readDetailObject(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

export function readDetailNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function readDetailBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

export function readDetailString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}
