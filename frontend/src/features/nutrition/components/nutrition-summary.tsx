import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Progress } from '@/components/ui/progress'

import type { MealLog, NutritionPlan, NutritionValues } from '../schemas'

interface NutritionSummaryProps {
  meals: MealLog[]
  plan: NutritionPlan | null
}

function calculateTotals(meals: MealLog[]): NutritionValues {
  const totals: NutritionValues = {
    caloriesKcal: 0,
    proteinG: 0,
    carbohydratesG: 0,
    fatG: 0,
    fiberG: 0,
  }

  for (const meal of meals) {
    for (const item of meal.items) {
      totals.caloriesKcal += item.caloriesKcal
      totals.proteinG += item.proteinG
      totals.carbohydratesG += item.carbohydratesG
      totals.fatG += item.fatG
      totals.fiberG += item.fiberG
    }
  }

  return totals
}

function formatValue(value: number): string {
  return value.toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  })
}

interface NutrientCardProps {
  label: string
  value: number
  goal?: number | null
  unit: string
}

function NutrientCard({ label, value, goal, unit }: NutrientCardProps) {
  const hasGoal = goal != null && goal > 0

  const percentage = hasGoal ? (value / goal) * 100 : 0

  const remaining = hasGoal ? Math.max(goal - value, 0) : 0

  const exceeded = hasGoal && value > goal

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{formatValue(value)}</span>

          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>

        {hasGoal ? (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Objectif : {formatValue(goal)} {unit}
              </span>

              <span>{Math.round(percentage)} %</span>
            </div>

            <Progress value={Math.min(percentage, 100)} />

            <p className="text-xs text-muted-foreground">
              {exceeded
                ? `Objectif dépassé de ${formatValue(value - goal)} ${unit}`
                : `${formatValue(remaining)} ${unit} restants`}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Aucun objectif défini</p>
        )}
      </CardContent>
    </Card>
  )
}

export function NutritionSummary({ meals, plan }: NutritionSummaryProps) {
  const totals = calculateTotals(meals)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <NutrientCard
        label="Calories"
        value={totals.caloriesKcal}
        goal={plan?.caloriesGoal}
        unit="kcal"
      />

      <NutrientCard label="Protéines" value={totals.proteinG} goal={plan?.proteinGoalG} unit="g" />

      <NutrientCard
        label="Glucides"
        value={totals.carbohydratesG}
        goal={plan?.carbohydratesGoalG}
        unit="g"
      />

      <NutrientCard label="Lipides" value={totals.fatG} goal={plan?.fatGoalG} unit="g" />

      <NutrientCard label="Fibres" value={totals.fiberG} goal={plan?.fiberGoalG} unit="g" />
    </div>
  )
}
