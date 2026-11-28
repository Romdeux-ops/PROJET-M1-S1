import type { RecoveryDailyTrendResponse } from '../../api/recovery-types'

import {
  formatRecoveryChartDate,
  formatRecoveryNumber,
  isAvailable,
} from '../../utils/recovery-format'

interface TrainingLoadChartProps {
  data: RecoveryDailyTrendResponse[]
}

const WIDTH = 720
const HEIGHT = 260

const PADDING = {
  top: 24,
  right: 24,
  bottom: 40,
  left: 60,
}

export function TrainingLoadChart({ data }: TrainingLoadChartProps) {
  const sortedData = data
    .filter(
      (
        item,
      ): item is RecoveryDailyTrendResponse & {
        date: string
      } => typeof item.date === 'string',
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  const loads = sortedData
    .map((item) => item.trainingLoad)
    .filter((value): value is number => isAvailable(value) && value >= 0)

  const maxLoad = Math.max(100, Math.ceil(Math.max(0, ...loads) / 100) * 100)

  const chartWidth = WIDTH - PADDING.left - PADDING.right

  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom

  const slotWidth = chartWidth / Math.max(1, sortedData.length)

  const barWidth = Math.min(32, slotWidth * 0.65)

  const labelStep = Math.max(1, Math.ceil(sortedData.length / 6))

  function getX(index: number) {
    return PADDING.left + slotWidth * (index + 0.5)
  }

  function getY(load: number) {
    return PADDING.top + (1 - load / maxLoad) * chartHeight
  }

  const gridValues = Array.from({ length: 6 }, (_, index) => (maxLoad * index) / 5)

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
      <div>
        <h3 className="font-semibold">Charge d'entraînement quotidienne</h3>

        <p className="text-sm text-muted-foreground">
          Charge sportive enregistrée en unités arbitraires (UA).
        </p>
      </div>

      {loads.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucune charge disponible sur cette période.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-auto w-full min-w-[320px]"
            role="img"
            aria-label="Historique de la charge d'entraînement"
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
                  {formatRecoveryNumber(value, 'UA', 0)}
                </text>
              </g>
            ))}

            {sortedData.map((item, index) => {
              const load = item.trainingLoad
              const x = getX(index)

              const available = isAvailable(load) && load >= 0

              return (
                <g key={`${item.date}-${index}`}>
                  {!available ? (
                    <text
                      x={x}
                      y={getY(0) - 8}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-[11px] opacity-40"
                    >
                      —
                    </text>
                  ) : load === 0 ? (
                    <circle cx={x} cy={getY(0)} r={3} fill="#f59e0b">
                      <title>{`${formatRecoveryChartDate(item.date)} : 0 UA`}</title>
                    </circle>
                  ) : (
                    <rect
                      x={x - barWidth / 2}
                      y={getY(load)}
                      width={barWidth}
                      height={getY(0) - getY(load)}
                      rx={3}
                      fill="#f59e0b"
                      opacity={0.85}
                    >
                      <title>
                        {`${formatRecoveryChartDate(item.date)} : ${formatRecoveryNumber(load, 'UA')}`}
                      </title>
                    </rect>
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
          </svg>
        </div>
      )}

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Une valeur de zéro correspond à une charge enregistrée nulle.</p>

        <p>
          Le symbole — indique une charge indisponible, notamment lorsque certaines informations
          sportives sont manquantes.
        </p>
      </div>
    </section>
  )
}
