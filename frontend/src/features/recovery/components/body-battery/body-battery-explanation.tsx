import { Info, ArrowDown, AlertTriangle } from 'lucide-react'

import type { RecoveryAssessmentResponse } from '../../api/recovery-types'

import {
  readDetailObject,
  readDetailNumber,
  readDetailBoolean,
  formatRecoveryNumber,
} from '../../utils/recovery-format'

interface BodyBatteryExplanationProps {
  assessment?: RecoveryAssessmentResponse | null
}

const MISSING_DATA_LABELS: Record<string, string> = {
  SLEEP_LOG: 'Journal du sommeil',
  DAILY_CHECKIN: 'Questionnaire quotidien',
  DAILY_TRAINING_LOAD: "Charge d'entraînement du jour",
  RECENT_TRAINING_LOAD: "Charge d'entraînement récente",
  ACTIVE_CALORIES: 'Estimation des calories actives',
  LAST_WORKOUT_REFERENCE: 'Référence du dernier entraînement',
}

export function BodyBatteryExplanation({ assessment }: BodyBatteryExplanationProps) {
  const details = readDetailObject(assessment?.calculationDetails)

  const battery = readDetailObject(details?.bodyBattery)

  const checkin = readDetailObject(details?.checkin)

  const initialized = readDetailBoolean(battery?.initialized)

  const previousBattery = readDetailNumber(battery?.previousBodyBattery)

  const morningBattery = readDetailNumber(battery?.morningBattery)

  const estimatedBattery = readDetailNumber(battery?.estimatedBattery)

  const energyLevel = readDetailNumber(checkin?.energyLevel)

  const hoursAwake = readDetailNumber(battery?.hoursAwake)

  const missingData = Array.isArray(details?.missingData)
    ? details.missingData.filter((item): item is string => typeof item === 'string')
    : []

  const steps = [
    {
      label: initialized ? 'Énergie initiale de référence' : 'Énergie de la veille',
      value: previousBattery,
      description: initialized
        ? 'Valeur de départ utilisée en absence de score précédent.'
        : 'Dernière estimation du jour précédent.',
    },
    {
      label: 'Énergie au réveil',
      value: morningBattery,
      description: 'Énergie après la recharge liée au sommeil, plafonnée à 100.',
    },
    {
      label: 'Énergie estimée avant ajustement',
      value: estimatedBattery,
      description: 'Énergie restante après les consommations estimées.',
    },
    {
      label: 'Body Battery finale',
      value: assessment?.bodyBattery,
      description: "Score ajusté en fonction de votre niveau d'énergie déclaré.",
    },
  ]

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <Info className="size-5 text-muted-foreground" />

        <h3 className="font-semibold">Comprendre votre Body Battery</h3>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Le modèle estime votre réserve d'énergie à partir du score précédent, de votre sommeil, de
        vos entraînements, du stress et de votre ressenti.
      </p>

      {initialized && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />

          <p className="text-xs leading-relaxed text-muted-foreground">
            Le modèle a été initialisé avec une valeur de référence, car aucune Body Battery
            exploitable n'était disponible pour la veille.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={step.label} className="space-y-2">
            {index > 0 && (
              <div className="flex justify-center">
                <ArrowDown className="size-4 text-muted-foreground" />
              </div>
            )}

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{step.label}</p>

                <p
                  className={`text-xl font-bold tabular-nums ${
                    index === steps.length - 1 ? 'text-blue-500' : ''
                  }`}
                >
                  {formatRecoveryNumber(step.value)}
                </p>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Temps éveillé estimé</p>

          <p className="mt-1 font-semibold">{formatRecoveryNumber(hoursAwake, 'h')}</p>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Énergie ressentie</p>

          <p className="mt-1 font-semibold">{formatRecoveryNumber(energyLevel, '/10')}</p>
        </div>
      </div>

      {missingData.length > 0 && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <h4 className="text-sm font-medium">
            Informations manquantes pour l'évaluation Recovery
          </h4>

          <ul className="space-y-2">
            {missingData.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />

                {MISSING_DATA_LABELS[item] ?? item}
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">
            Certaines de ces informations concernent les autres indicateurs Recovery et ne sont pas
            indispensables au calcul de la Body Battery.
          </p>
        </div>
      )}

      <div className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        Version du modèle : {assessment?.algorithmVersion ?? 'Non disponible'}.
        <p className="mt-2">
          La Body Battery FitCoach est un indicateur expérimental. Elle ne mesure pas directement
          une réserve d'énergie physiologique.
        </p>
      </div>
    </section>
  )
}
