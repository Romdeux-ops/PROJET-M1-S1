import { CalendarDays, Target } from 'lucide-react'

import { ErrorState } from '@/components/feedback'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useCurrentNutritionPlan, useNutritionPlans } from '../hooks/use-nutrition-plans'

import type { NutritionPlan } from '../schemas'

import { NutritionPlanForm } from './nutrition-plan-form'

interface NutritionPlansPanelProps {
  selectedDate: string
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR')
}

function formatValue(value: number): string {
  return value.toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  })
}

interface PlanCardProps {
  plan: NutritionPlan
  isCurrent: boolean
}

function PlanCard({ plan, isCurrent }: PlanCardProps) {
  const nutrients = [
    {
      label: 'Calories',
      value: plan.caloriesGoal,
      unit: 'kcal',
    },
    {
      label: 'Protéines',
      value: plan.proteinGoalG,
      unit: 'g',
    },
    {
      label: 'Glucides',
      value: plan.carbohydratesGoalG,
      unit: 'g',
    },
    {
      label: 'Lipides',
      value: plan.fatGoalG,
      unit: 'g',
    },
    {
      label: 'Fibres',
      value: plan.fiberGoalG,
      unit: 'g',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-5" />
            Objectif nutritionnel
          </CardTitle>

          {isCurrent && <Badge>Actuel</Badge>}
        </div>

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          Du {formatDate(plan.validFrom)}
          {plan.validTo ? ` au ${formatDate(plan.validTo)}` : ' — Sans date de fin'}
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {nutrients.map((nutrient) => (
            <div key={nutrient.label} className="space-y-1 rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{nutrient.label}</p>

              <p className="text-xl font-semibold">
                {nutrient.value == null ? '—' : formatValue(nutrient.value)}

                {nutrient.value != null && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {nutrient.unit}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function NutritionPlansPanel({ selectedDate }: NutritionPlansPanelProps) {
  const plans = useNutritionPlans()
  const currentPlan = useCurrentNutritionPlan()

  const otherPlans = (plans.data ?? []).filter((plan) => plan.id !== currentPlan.data?.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Objectifs nutritionnels</h2>

          <p className="text-sm text-muted-foreground">
            Définissez et consultez vos objectifs journaliers.
          </p>
        </div>

        <NutritionPlanForm selectedDate={selectedDate} />
      </div>

      {/* OBJECTIF ACTUEL */}

      <section className="space-y-3">
        <h3 className="font-semibold">Objectif actuel</h3>

        {currentPlan.isError ? (
          <ErrorState error={currentPlan.error} onRetry={() => void currentPlan.refetch()} />
        ) : currentPlan.isPending ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : currentPlan.data ? (
          <PlanCard plan={currentPlan.data} isCurrent={true} />
        ) : (
          <Card>
            <CardContent className="space-y-2 py-6 text-center">
              <Target className="mx-auto size-8 text-muted-foreground" />

              <p className="font-medium">Aucun objectif actuel</p>

              <p className="text-sm text-muted-foreground">
                Créez un objectif nutritionnel pour suivre votre progression quotidienne.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* HISTORIQUE DES OBJECTIFS */}

      <section className="space-y-3">
        <h3 className="font-semibold">Autres objectifs</h3>

        <p className="text-sm text-muted-foreground">
          Retrouvez vos anciens objectifs et ceux programmés pour une période future.
        </p>

        {plans.isError ? (
          <ErrorState error={plans.error} onRetry={() => void plans.refetch()} />
        ) : plans.isPending || currentPlan.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : otherPlans.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Aucun autre objectif enregistré.
          </div>
        ) : (
          otherPlans.map((plan) => <PlanCard key={plan.id} plan={plan} isCurrent={false} />)
        )}
      </section>
    </div>
  )
}
