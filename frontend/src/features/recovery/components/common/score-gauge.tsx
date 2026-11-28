import {
  getScoreLabel,
  normalizeScore,
  SCORE_COLORS,
  SCORE_LABELS,
  type ScoreKind,
} from '../../utils/recovery-format'

interface ScoreGaugeProps {
  kind: ScoreKind
  score: number | null | undefined
  size?: number
  showLabel?: boolean
  showDescription?: boolean
}

export function ScoreGauge({
  kind,
  score,
  size = 160,
  showLabel = true,
  showDescription = true,
}: ScoreGaugeProps) {
  const normalizedScore = normalizeScore(score)

  const radius = 64
  const circumference = 2 * Math.PI * radius

  const offset =
    normalizedScore === null ? circumference : circumference * (1 - normalizedScore / 100)

  const color = SCORE_COLORS[kind]
  const label = SCORE_LABELS[kind]
  const description = getScoreLabel(kind, normalizedScore)

  return (
    <div className="flex flex-col items-center gap-2">
      {showLabel && <p className="text-center text-sm font-medium">{label}</p>}

      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        className="max-w-full"
        role="img"
        aria-label={
          normalizedScore === null
            ? `${label} : données insuffisantes`
            : `${label} : ${normalizedScore} sur 100`
        }
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="opacity-10"
        />

        {normalizedScore !== null && normalizedScore > 0 && (
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 80 80)"
            className="transition-all duration-700 ease-out motion-reduce:transition-none"
          />
        )}

        <text
          x="80"
          y="84"
          textAnchor="middle"
          fill="currentColor"
          className="text-[38px] font-bold"
        >
          {normalizedScore ?? '—'}
        </text>

        <text
          x="80"
          y="105"
          textAnchor="middle"
          fill="currentColor"
          className="text-[13px] opacity-50"
        >
          / 100
        </text>
      </svg>

      {showDescription && (
        <p className="text-center text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
