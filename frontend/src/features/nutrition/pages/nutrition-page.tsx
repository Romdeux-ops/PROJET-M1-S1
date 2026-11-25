import { useState } from 'react'

import { Apple, CalendarDays, Coffee, Moon, Utensils } from 'lucide-react'

import { ErrorState } from '@/components/feedback'
import { PageHeader } from '@/components/page-header'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { MealJournal } from '../components/meal-journal'
import { NutritionSummary } from '../components/nutrition-summary'
import { NutritionPlansPanel } from '../components/nutrition-plans-panel'
import { RecipesPanel } from '../components/recipes-panel'

import { useMeals } from '../hooks/use-meals'
import { useNutritionPlanByDate } from '../hooks/use-nutrition-plans'

import { mealTypes, MEAL_TYPE_LABELS, type MealType } from '../schemas'

// ======================================================
// CONSTANTES
// ======================================================

const MEAL_ICONS = {
  BREAKFAST: Coffee,
  LUNCH: Utensils,
  DINNER: Moon,
  SNACK: Apple,
}

// ======================================================
// GESTION DES DATES
// ======================================================

function getLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDayFilters(date: string) {
  if (!date) {
    return {
      start: '',
      end: '',
    }
  }

  const start = new Date(`${date}T00:00:00`)
  const end = new Date(`${date}T23:59:59.999`)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

// ======================================================
// PAGE PRINCIPALE NUTRITION
// ======================================================

export function NutritionPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const [selectedDate, setSelectedDate] = useState(() => getLocalDate(new Date()))
  const [today] = useState(() => getLocalDate(new Date()))

  const showDateSelector = activeTab === 'overview' || activeTab === 'meals'

  const filters = getDayFilters(selectedDate)

  const meals = useMeals(filters)
  const plan = useNutritionPlanByDate(selectedDate)

  const mealList = meals.data ?? []

  function getMealCalories(mealType: MealType): number {
    return mealList
      .filter((meal) => meal.mealType === mealType)
      .flatMap((meal) => meal.items)
      .reduce((total, item) => total + item.caloriesKcal, 0)
  }

  return (
    <>
      <PageHeader
        title="Nutrition"
        description="Suivez votre alimentation et vos objectifs nutritionnels."
      />

      {/* ============================================== */}
      {/* SELECTEUR DE DATE                              */}
      {/* Visible uniquement dans Vue d'ensemble         */}
      {/* et Journal alimentaire                         */}
      {/* ============================================== */}

      {showDateSelector && (
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="nutrition-date" className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Date sélectionnée
            </Label>

            <Input
              id="nutrition-date"
              type="date"
              value={selectedDate}
              onChange={(event) => {
                if (event.target.value) {
                  setSelectedDate(event.target.value)
                }
              }}
              className="w-auto"
            />
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* NAVIGATION PRINCIPALE                          */}
      {/* ============================================== */}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>

          <TabsTrigger value="meals">Journal alimentaire</TabsTrigger>

          <TabsTrigger value="plans">Objectifs</TabsTrigger>

          <TabsTrigger value="recipes">Recettes</TabsTrigger>
        </TabsList>

        {/* ============================================== */}
        {/* TABLEAU DE BORD                                */}
        {/* ============================================== */}

        <TabsContent value="overview" className="space-y-6">
          {meals.isError ? (
            <ErrorState error={meals.error} onRetry={() => void meals.refetch()} />
          ) : plan.isError ? (
            <ErrorState error={plan.error} onRetry={() => void plan.refetch()} />
          ) : meals.isPending || plan.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <NutritionSummary meals={mealList} plan={plan.data ?? null} />

              {!plan.data && (
                <Card>
                  <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Aucun objectif nutritionnel n'est défini pour cette journée.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Mes repas</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {mealTypes.map((mealType) => {
                    const Icon = MEAL_ICONS[mealType]

                    const matchingMeals = mealList.filter((meal) => meal.mealType === mealType)

                    const calories = getMealCalories(mealType)

                    const itemCount = matchingMeals.reduce(
                      (total, meal) => total + meal.items.length,
                      0,
                    )

                    return (
                      <Card key={mealType}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Icon className="size-5" />

                            {MEAL_TYPE_LABELS[mealType]}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-2">
                          <p className="text-xl font-semibold">
                            {calories.toLocaleString('fr-FR', {
                              maximumFractionDigits: 2,
                            })}{' '}
                            kcal
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {matchingMeals.length} repas · {itemCount} aliment
                            {itemCount > 1 ? 's' : ''}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ============================================== */}
        {/* JOURNAL ALIMENTAIRE                            */}
        {/* ============================================== */}

        <TabsContent value="meals" className="space-y-6">
          {meals.isError ? (
            <ErrorState error={meals.error} onRetry={() => void meals.refetch()} />
          ) : meals.isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <MealJournal meals={mealList} selectedDate={selectedDate} />
          )}
        </TabsContent>

        {/* ============================================== */}
        {/* OBJECTIFS NUTRITIONNELS                        */}
        {/* ============================================== */}

        <TabsContent value="plans" className="space-y-6">
          <NutritionPlansPanel selectedDate={today} />
        </TabsContent>

        {/* ============================================== */}
        {/* RECETTES                                       */}
        {/* ============================================== */}

        <TabsContent value="recipes" className="space-y-6">
          <RecipesPanel />
        </TabsContent>
      </Tabs>
    </>
  )
}
