import type { RecoveryDailyTrendResponse } from '../../api/recovery-types'

import {
  formatRecoveryChartDate,
  formatRecoveryDuration,
  isAvailable,
} from '../../utils/recovery-format'

interface SleepDurationChartProps {
  data: RecoveryDailyTrendResponse[]
  targetMinutes?: number | null
}

const WIDTH = 720
const HEIGHT = 260

const PADDING = {
  top: 24,
  right: 24,
  bottom: 40,
  left: 44,
}

export function SleepDurationChart({ data, targetMinutes }: SleepDurationChartProps) {
  const sortedData = data
    .filter(
      (
        item,
      ): item is RecoveryDailyTrendResponse & {
        date: string
      } => typeof item.date === 'string',
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  const durations = sortedData
    .map((item) => item.estimatedSleepMinutes)
    .filter((value): value is number => isAvailable(value) && value >= 0)

  const hasData = durations.length > 0

  const validTarget = isAvailable(targetMinutes) && targetMinutes > 0 ? targetMinutes : null

  const maxMinutes = Math.max(600, Math.ceil(Math.max(validTarget ?? 0, ...durations) / 120) * 120)

  const chartWidth = WIDTH - PADDING.left - PADDING.right

  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom

  const slotWidth = chartWidth / Math.max(1, sortedData.length)

  const barWidth = Math.min(32, slotWidth * 0.65)

  const labelStep = Math.max(1, Math.ceil(sortedData.length / 6))

  function getX(index: number) {
    return PADDING.left + slotWidth * (index + 0.5)
  }

  function getY(minutes: number) {
    return PADDING.top + (1 - minutes / maxMinutes) * chartHeight
  }

  const gridValues = Array.from({ length: 6 }, (_, index) => (maxMinutes * index) / 5)

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
      <div>
        <h3 className="font-semibold">Durée du sommeil</h3>

        <p className="text-sm text-muted-foreground">Comparaison avec votre objectif actuel.</p>
      </div>

      {!hasData ? (
        <div className="flex min-h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucune durée disponible pour cette période.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-auto w-full min-w-[320px]"
              role="img"
              aria-label="Historique des durées de sommeil"
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
                    {Number((value / 60).toFixed(1))} h
                  </text>
                </g>
              ))}

              {sortedData.map((item, index) => {
                const duration = item.estimatedSleepMinutes

                const available = isAvailable(duration) && duration >= 0

                const x = getX(index)

                return (
                  <g key={`${item.date}-${index}`}>
                    {available ? (
                      <rect
                        x={x - barWidth / 2}
                        y={getY(duration)}
                        width={barWidth}
                        height={getY(0) - getY(duration)}
                        rx={3}
                        fill="#8b5cf6"
                        opacity={item.sleepDurationApproximate ? 0.5 : 0.9}
                      >
                        <title>
                          {`${formatRecoveryChartDate(item.date)} : ${formatRecoveryDuration(duration)}${item.sleepDurationApproximate ? ' (approximative)' : ''}`}
                        </title>
                      </rect>
                    ) : (
                      <text
                        x={x}
                        y={getY(0) - 8}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-[11px] opacity-40"
                      >
                        —
                      </text>
                    )}

                    {(index === 0 ||
                      index === sortedData.length - 1 ||
                      (index % labelStep === 0 && sortedData.length - 1 - index >= labelStep)) && (
                      <text
                        x={x}
                        y={HEIGHT - 10}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-[11px] opacity-60"
                      >
                        {formatRecoveryChartDate(item.date)}
                      </text>
                    )}
                  </g>
                )
              })}

              {validTarget !== null && (
                <line
                  x1={PADDING.left}
                  y1={getY(validTarget)}
                  x2={WIDTH - PADDING.right}
                  y2={getY(validTarget)}
                  stroke="#14b8a6"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                >
                  <title>{`Objectif actuel : ${formatRecoveryDuration(validTarget)}`}</title>
                </line>
              )}
            </svg>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-violet-500" />
              Durée estimée
            </span>

            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-violet-500/50" />
              Durée approximative
            </span>

            {validTarget !== null && (
              <span className="flex items-center gap-2">
                <span className="w-5 border-t-2 border-dashed border-teal-500" />
                Objectif actuel : {formatRecoveryDuration(validTarget)}
              </span>
            )}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        L'objectif affiché est votre objectif actuel, pas nécessairement celui utilisé à la date de
        chaque nuit.
      </p>
    </section>
  )
}
