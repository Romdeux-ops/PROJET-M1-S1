import { Scale } from 'lucide-react'

import type { RecoveryWeightSummaryResponse } from '../../api/recovery-types'

import {
  formatRecoveryWeight,
  formatRecoveryWeightChange,
  formatRecoveryPercentage,
  formatRecoveryChartDate,
  isAvailable,
} from '../../utils/recovery-format'

interface WeightSummaryProps {
  summary?: RecoveryWeightSummaryResponse | null
}

const WIDTH = 600
const HEIGHT = 220

const PADDING = {
  top: 20,
  right: 30,
  bottom: 35,
  left: 60,
}

export function WeightSummary({ summary }: WeightSummaryProps) {
  const points = (summary?.history ?? [])
    .flatMap((item) => {
      if (typeof item.date !== 'string' || !isAvailable(item.weightKg)) {
        return []
      }

      const timestamp = Date.parse(item.date)

      if (!Number.isFinite(timestamp)) {
        return []
      }

      return [
        {
          date: item.date,
          timestamp,
          weightKg: item.weightKg,
        },
      ]
    })
    .sort((a, b) => a.timestamp - b.timestamp)

  const weights = points.map((point) => point.weightKg)

  const minWeight = weights.length > 0 ? Math.min(...weights) : 0

  const maxWeight = weights.length > 0 ? Math.max(...weights) : 0

  const margin = Math.max(0.5, (maxWeight - minWeight) * 0.15)

  const minY = Math.max(0, minWeight - margin)
  const maxY = maxWeight + margin

  const chartWidth = WIDTH - PADDING.left - PADDING.right

  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom

  const firstTime = points[0]?.timestamp ?? 0

  const lastTime = points[points.length - 1]?.timestamp ?? firstTime

  function getX(timestamp: number) {
    if (lastTime === firstTime) {
      return PADDING.left + chartWidth / 2
    }

    return PADDING.left + ((timestamp - firstTime) / (lastTime - firstTime)) * chartWidth
  }

  function getY(weight: number) {
    return PADDING.top + (1 - (weight - minY) / (maxY - minY)) * chartHeight
  }

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${getX(point.timestamp)} ${getY(point.weightKg)}`,
    )
    .join(' ')

  const gridValues = Array.from({ length: 5 }, (_, index) => minY + ((maxY - minY) * index) / 4)

  const labelStep = Math.max(1, Math.ceil(points.length / 4))

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <Scale className="size-5 text-primary" />
        </div>

        <div>
          <h3 className="font-semibold">Évolution du poids</h3>

          <p className="text-xs text-muted-foreground">30 derniers jours</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Dernier poids connu</p>

          <p className="mt-1 text-2xl font-bold tabular-nums">
            {formatRecoveryWeight(summary?.currentWeightKg)}
          </p>

          {summary?.currentWeightMeasuredOn && (
            <p className="text-xs text-muted-foreground">
              {formatRecoveryChartDate(summary.currentWeightMeasuredOn)}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Variation</p>

          <p className="mt-1 text-2xl font-bold tabular-nums">
            {formatRecoveryWeightChange(summary?.weightChangeKg)}
          </p>

          <p className="text-xs text-muted-foreground">
            {formatRecoveryPercentage(summary?.weightChangePercentage)}
          </p>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">Aucune mesure sur cette période.</p>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Historique des mesures de poids"
        >
          {gridValues.map((value, index) => (
            <g key={index}>
              <line
                x1={PADDING.left}
                y1={getY(value)}
                x2={WIDTH - PADDING.right}
                y2={getY(value)}
                stroke="currentColor"
                strokeDasharray="4 4"
                className="opacity-10"
              />

              <text
                x={PADDING.left - 10}
                y={getY(value) + 4}
                textAnchor="end"
                fill="currentColor"
                className="text-[11px] opacity-60"
              >
                {value.toFixed(1)} kg
              </text>
            </g>
          ))}

          <path
            d={path}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <g key={`${point.date}-${index}`}>
              <circle cx={getX(point.timestamp)} cy={getY(point.weightKg)} r="4" fill="#14b8a6">
                <title>
                  {`${formatRecoveryChartDate(point.date)} : ${formatRecoveryWeight(point.weightKg)}`}
                </title>
              </circle>

              {(index === 0 ||
                index === points.length - 1 ||
                (index % labelStep === 0 && points.length - 1 - index >= labelStep)) && (
                <text
                  x={getX(point.timestamp)}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-[11px] opacity-60"
                >
                  {formatRecoveryChartDate(point.date)}
                </text>
              )}
            </g>
          ))}
        </svg>
      )}

      <p className="text-xs text-muted-foreground">
        {points.length} mesure(s) enregistrée(s) sur la période. Les points représentent les mesures
        réelles.
      </p>

      {summary?.referenceWeightMeasuredOn && (
        <p className="text-xs text-muted-foreground">
          Mesure de référence : {formatRecoveryWeight(summary.referenceWeightKg)}
          {' — '}
          {formatRecoveryChartDate(summary.referenceWeightMeasuredOn)}
        </p>
      )}
    </section>
  )
}
