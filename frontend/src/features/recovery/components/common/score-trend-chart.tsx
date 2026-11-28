import { useId } from 'react'

import type { RecoveryDailyTrendResponse } from '../../api/recovery-types'

import {
  formatRecoveryChartDate,
  normalizeScore,
  SCORE_COLORS,
  SCORE_LABELS,
  type ScoreKind,
} from '../../utils/recovery-format'

interface ScoreTrendChartProps {
  data: RecoveryDailyTrendResponse[]
  metrics?: ScoreKind[]
  title?: string
  description?: string
}

interface ChartPoint {
  x: number
  y: number
  score: number
  date: string
}

const DEFAULT_METRICS: ScoreKind[] = ['bodyBattery', 'sleepScore', 'trainingReadiness']

const WIDTH = 720
const HEIGHT = 260

const PADDING = {
  top: 20,
  right: 24,
  bottom: 40,
  left: 44,
}

const GRID_VALUES = [0, 25, 50, 75, 100]

function buildPath(points: Array<ChartPoint | null>): string {
  let path = ''
  let previousAvailable = false

  for (const point of points) {
    if (point === null) {
      previousAvailable = false
      continue
    }

    path += `${previousAvailable ? 'L' : 'M'} ${point.x} ${point.y} `
    previousAvailable = true
  }

  return path.trim()
}

export function ScoreTrendChart({
  data,
  metrics = DEFAULT_METRICS,
  title = 'Évolution des scores',
  description,
}: ScoreTrendChartProps) {
  const titleId = useId()

  const sortedData = data
    .filter(
      (
        item,
      ): item is RecoveryDailyTrendResponse & {
        date: string
      } => typeof item.date === 'string',
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  const chartWidth = WIDTH - PADDING.left - PADDING.right

  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom

  function getX(index: number) {
    if (sortedData.length <= 1) {
      return PADDING.left + chartWidth / 2
    }

    return PADDING.left + (index / (sortedData.length - 1)) * chartWidth
  }

  function getY(score: number) {
    return PADDING.top + (1 - score / 100) * chartHeight
  }

  const series = metrics.map((metric) => {
    const points = sortedData.map((item, index) => {
      const score = normalizeScore(item[metric])

      if (score === null) return null

      return {
        x: getX(index),
        y: getY(score),
        score,
        date: item.date,
      }
    })

    return {
      metric,
      points,
      path: buildPath(points),
    }
  })

  const hasData = series.some((item) => item.points.some((point) => point !== null))

  const labelStep = Math.max(1, Math.ceil(sortedData.length / 6))

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <div className="mb-4 space-y-1">
        <h3 id={titleId} className="font-semibold">
          {title}
        </h3>

        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {!hasData ? (
        <div className="flex min-h-48 items-center justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Aucune donnée disponible pour cette période.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-auto w-full min-w-[320px]"
              role="img"
              aria-labelledby={titleId}
            >
              {GRID_VALUES.map((value) => (
                <g key={value}>
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
                    {value}
                  </text>
                </g>
              ))}

              {sortedData.map((item, index) => {
                const isLast = index === sortedData.length - 1

                const shouldDisplay =
                  index === 0 ||
                  isLast ||
                  (index % labelStep === 0 && sortedData.length - 1 - index >= labelStep)

                if (!shouldDisplay) return null

                return (
                  <text
                    key={`${item.date}-${index}`}
                    x={getX(index)}
                    y={HEIGHT - 10}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[11px] opacity-60"
                  >
                    {formatRecoveryChartDate(item.date)}
                  </text>
                )
              })}

              {series.map((item) => (
                <g key={item.metric}>
                  <path
                    d={item.path}
                    fill="none"
                    stroke={SCORE_COLORS[item.metric]}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {item.points.map((point, index) => {
                    if (point === null) return null

                    return (
                      <circle
                        key={`${point.date}-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r="3.5"
                        fill={SCORE_COLORS[item.metric]}
                      >
                        <title>
                          {`${formatRecoveryChartDate(point.date)} — ${SCORE_LABELS[item.metric]} : ${point.score}/100`}
                        </title>
                      </circle>
                    )
                  })}
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {metrics.map((metric) => (
              <div key={metric} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: SCORE_COLORS[metric],
                  }}
                />

                {SCORE_LABELS[metric]}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
