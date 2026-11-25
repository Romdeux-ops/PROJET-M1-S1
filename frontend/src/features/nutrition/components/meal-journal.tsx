import { useState, type FormEvent } from 'react'

import { Apple, Coffee, Moon, Pencil, Trash2, Utensils } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { useDeleteMeal, useDeleteMealItem, useUpdateMealItem } from '../hooks/use-meals'

import {
  mealTypes,
  MEAL_TYPE_LABELS,
  updateMealItemSchema,
  type MealLog,
  type MealLogItem,
} from '../schemas'

import { AddMealItemForm, MealForm } from './meal-form'

// ======================================================
// CONSTANTES
// ======================================================

const MEAL_ICONS = {
  BREAKFAST: Coffee,
  LUNCH: Utensils,
  DINNER: Moon,
  SNACK: Apple,
}

interface MealJournalProps {
  meals: MealLog[]
  selectedDate: string
}

// ======================================================
// FORMATAGE
// ======================================================

function format(value: number): string {
  return value.toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  })
}

// ======================================================
// ACTIONS SUR UN ALIMENT
// ======================================================

function MealItemActions({ mealLogId, item }: { mealLogId: string; item: MealLogItem }) {
  const [open, setOpen] = useState(false)

  const [quantity, setQuantity] = useState(String(item.quantityG))

  const [error, setError] = useState('')

  const updateItem = useUpdateMealItem(mealLogId)
  const deleteItem = useDeleteMealItem(mealLogId)

  const isPending = updateItem.isPending || deleteItem.isPending

  function handleOpenChange(value: boolean) {
    if (isPending) return

    if (value) {
      setQuantity(String(item.quantityG))
      setError('')
      updateItem.reset()
    }

    setOpen(value)
  }

  // Modification de la quantité
  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const result = updateMealItemSchema.safeParse({
      quantityG: Number(quantity),
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Quantité invalide')

      return
    }

    updateItem.mutate(
      {
        itemId: item.id,
        input: result.data,
      },
      {
        onSuccess: () => {
          setOpen(false)
        },

        onError: (error) => {
          setError(error.message)
        },
      },
    )
  }

  // Suppression individuelle
  function handleDelete() {
    const confirmed = window.confirm(`Voulez-vous supprimer ${item.foodName} de ce repas ?`)

    if (confirmed) {
      deleteItem.mutate(item.id)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {/* Bouton de modification */}

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              aria-label={`Modifier ${item.foodName}`}
              title="Modifier la quantité"
            >
              <Pencil className="size-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier la quantité</DialogTitle>

              <DialogDescription>
                Modifiez la quantité consommée. Les valeurs nutritionnelles seront recalculées
                automatiquement.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium">{item.foodName}</p>

                <p className="text-sm text-muted-foreground">
                  Quantité actuelle : {format(item.quantityG)} g
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`quantity-${item.id}`}>Nouvelle quantité (g)</Label>

                <Input
                  id={`quantity-${item.id}`}
                  type="number"
                  min="0.01"
                  max="999999.99"
                  step="0.01"
                  required
                  value={quantity}
                  disabled={isPending}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>

                <Button type="submit" disabled={isPending}>
                  {updateItem.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bouton de suppression */}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          aria-label={`Supprimer ${item.foodName}`}
          title="Supprimer cet aliment"
          onClick={handleDelete}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      {deleteItem.isError && (
        <p role="alert" className="text-xs text-destructive">
          {deleteItem.error.message}
        </p>
      )}
    </div>
  )
}

// ======================================================
// CARTE D'UN REPAS
// ======================================================

function MealCard({ meal }: { meal: MealLog }) {
  const deleteMeal = useDeleteMeal()

  const totals = meal.items.reduce(
    (total, item) => ({
      calories: total.calories + item.caloriesKcal,
      protein: total.protein + item.proteinG,
      carbohydrates: total.carbohydrates + item.carbohydratesG,
      fat: total.fat + item.fatG,
      fiber: total.fiber + item.fiberG,
    }),
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
    },
  )

  function handleDelete() {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer ce repas et tous ses aliments ?',
    )

    if (confirmed) {
      deleteMeal.mutate(meal.id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{MEAL_TYPE_LABELS[meal.mealType]}</CardTitle>

            <p className="text-xs text-muted-foreground">
              {new Date(meal.consumedAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AddMealItemForm mealLogId={meal.id} />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Supprimer le repas"
              title="Supprimer le repas"
              disabled={deleteMeal.isPending}
              onClick={handleDelete}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Notes du repas */}

        {meal.notes && <p className="text-sm text-muted-foreground">{meal.notes}</p>}

        {/* Tableau des aliments */}

        {meal.items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Aucun aliment enregistré dans ce repas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-2">Aliment</th>
                  <th className="p-2">Quantité</th>
                  <th className="p-2">Calories</th>
                  <th className="p-2">Protéines</th>
                  <th className="p-2">Glucides</th>
                  <th className="p-2">Lipides</th>
                  <th className="p-2">Fibres</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {meal.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 font-medium">{item.foodName}</td>

                    <td className="p-2 whitespace-nowrap">{format(item.quantityG)} g</td>

                    <td className="p-2 whitespace-nowrap">{format(item.caloriesKcal)} kcal</td>

                    <td className="p-2 whitespace-nowrap">{format(item.proteinG)} g</td>

                    <td className="p-2 whitespace-nowrap">{format(item.carbohydratesG)} g</td>

                    <td className="p-2 whitespace-nowrap">{format(item.fatG)} g</td>

                    <td className="p-2 whitespace-nowrap">{format(item.fiberG)} g</td>

                    <td className="p-2">
                      <MealItemActions mealLogId={meal.id} item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totaux nutritionnels du repas */}

        <div className="flex flex-wrap gap-4 rounded-lg bg-muted p-3 text-sm">
          <span className="font-semibold">{format(totals.calories)} kcal</span>

          <span>Protéines : {format(totals.protein)} g</span>

          <span>Glucides : {format(totals.carbohydrates)} g</span>

          <span>Lipides : {format(totals.fat)} g</span>

          <span>Fibres : {format(totals.fiber)} g</span>
        </div>

        {/* Erreur de suppression du repas */}

        {deleteMeal.isError && (
          <p role="alert" className="text-sm text-destructive">
            {deleteMeal.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ======================================================
// JOURNAL ALIMENTAIRE
// ======================================================

export function MealJournal({ meals, selectedDate }: MealJournalProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Journal alimentaire</h2>

          <p className="text-sm text-muted-foreground">Retrouvez tous vos repas de la journée.</p>
        </div>

        <MealForm selectedDate={selectedDate} />
      </div>

      {mealTypes.map((mealType) => {
        const Icon = MEAL_ICONS[mealType]

        const matchingMeals = meals.filter((meal) => meal.mealType === mealType)

        return (
          <section key={mealType} className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <Icon className="size-5" />

              {MEAL_TYPE_LABELS[mealType]}
            </h3>

            {matchingMeals.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Aucun repas enregistré.
              </div>
            ) : (
              matchingMeals.map((meal) => <MealCard key={meal.id} meal={meal} />)
            )}
          </section>
        )
      })}
    </div>
  )
}
