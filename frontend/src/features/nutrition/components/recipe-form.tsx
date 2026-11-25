
import { useState, type FormEvent } from 'react'

import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  useCreateRecipe,
  useUpdateRecipe,
} from '../hooks/use-recipes'

import { useFoods } from '../hooks/use-foods'

import {
  recipeSchema,
  type Food,
  type Recipe,
  type RecipeItemInput,
} from '../schemas'

import { FoodSelector } from './food-selector'

interface RecipeFormProps {
  recipe?: Recipe
}

function format(value: number): string {
  return value.toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  })
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const isEditing = Boolean(recipe)

  const [open, setOpen] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState('1')
  const [preparationMinutes, setPreparationMinutes] = useState('')
  const [instructions, setInstructions] = useState('')

  const [items, setItems] = useState<RecipeItemInput[]>([])

  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [error, setError] = useState('')

  const foods = useFoods()

  const createRecipe = useCreateRecipe()
  const updateRecipe = useUpdateRecipe(recipe?.id ?? '')

  const isPending =
    createRecipe.isPending || updateRecipe.isPending

  // ======================================================
  // INITIALISATION DU FORMULAIRE
  // ======================================================

  function handleOpenChange(value: boolean) {
    if (value) {
      setName(recipe?.name ?? '')
      setDescription(recipe?.description ?? '')
      setServings(String(recipe?.servings ?? 1))

      setPreparationMinutes(
        recipe?.preparationMinutes != null
          ? String(recipe.preparationMinutes)
          : '',
      )

      setInstructions(recipe?.instructions ?? '')

      setItems(
        recipe?.items.map((item) => ({
          foodId: item.foodId,
          quantityG: item.quantityG,
        })) ?? [],
      )

      setSelectedFood(null)
      setQuantity('100')
      setError('')
    }

    setOpen(value)
  }

  // ======================================================
  // GESTION DES INGREDIENTS
  // ======================================================

  function handleAddIngredient() {
    setError('')

    const quantityG = Number(quantity)

    if (
      !selectedFood ||
      !Number.isFinite(quantityG) ||
      quantityG <= 0
    ) {
      setError('Sélectionnez un aliment et une quantité valide.')
      return
    }

    setItems((previous) => {
      const existing = previous.find(
        (item) => item.foodId === selectedFood.id,
      )

      if (existing) {
        return previous.map((item) =>
          item.foodId === selectedFood.id
            ? {
                ...item,
                quantityG: item.quantityG + quantityG,
              }
            : item,
        )
      }

      return [
        ...previous,
        {
          foodId: selectedFood.id,
          quantityG,
        },
      ]
    })

    setSelectedFood(null)
    setQuantity('100')
  }

  function handleRemoveIngredient(foodId: string) {
    setItems((previous) =>
      previous.filter((item) => item.foodId !== foodId),
    )
  }

  function getFoodName(foodId: string): string {
    return (
      foods.data?.find((food) => food.id === foodId)?.name ??
      recipe?.items.find((item) => item.foodId === foodId)?.foodName ??
      'Aliment inconnu'
    )
  }

  // ======================================================
  // CALCUL NUTRITIONNEL
  // ======================================================

  const totals = items.reduce(
    (total, item) => {
      const food = foods.data?.find(
        (entry) => entry.id === item.foodId,
      )

      if (!food) {
        return total
      }

      const factor = item.quantityG / 100

      return {
        calories: total.calories + food.caloriesKcal * factor,
        protein: total.protein + food.proteinG * factor,
        carbohydrates:
          total.carbohydrates + food.carbohydratesG * factor,
        fat: total.fat + food.fatG * factor,
        fiber: total.fiber + food.fiberG * factor,
      }
    },
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
    },
  )

  const portionCount =
    Number.isFinite(Number(servings)) && Number(servings) > 0
      ? Number(servings)
      : 1

  // ======================================================
  // ENREGISTREMENT
  // ======================================================

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const result = recipeSchema.safeParse({
      name,
      description,
      servings: Number(servings),

      preparationMinutes: preparationMinutes
        ? Number(preparationMinutes)
        : undefined,

      instructions,
      items,
    })

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          'Les données sont invalides.',
      )
      return
    }

    const callbacks = {
      onSuccess: () => {
        setOpen(false)
        setError('')
      },

      onError: (mutationError: Error) => {
        setError(mutationError.message)
      },
    }

    if (isEditing) {
      updateRecipe.mutate(result.data, callbacks)
    } else {
      createRecipe.mutate(result.data, callbacks)
    }
  }

  // ======================================================
  // INTERFACE
  // ======================================================

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-4" />
            Modifier
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Nouvelle recette
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Modifier la recette'
              : 'Nouvelle recette'}
          </DialogTitle>

          <DialogDescription>
            Renseignez les ingrédients et les informations
            de votre recette.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* INFORMATIONS GENERALES */}

          <div className="space-y-2">
            <Label htmlFor="recipe-name">
              Nom de la recette
            </Label>

            <Input
              id="recipe-name"
              required
              maxLength={200}
              placeholder="Poulet, riz et brocoli"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipe-description">
              Description (facultatif)
            </Label>

            <Textarea
              id="recipe-description"
              maxLength={2000}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Décrivez votre recette..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-servings">
                Nombre de portions
              </Label>

              <Input
                id="recipe-servings"
                type="number"
                min="1"
                step="1"
                required
                value={servings}
                onChange={(event) =>
                  setServings(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipe-preparation">
                Préparation (min)
              </Label>

              <Input
                id="recipe-preparation"
                type="number"
                min="1"
                step="1"
                placeholder="Facultatif"
                value={preparationMinutes}
                onChange={(event) =>
                  setPreparationMinutes(event.target.value)
                }
              />
            </div>
          </div>

          {/* SELECTION DES INGREDIENTS */}

          <section className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">
              Ajouter des ingrédients
            </h3>

            <FoodSelector
              onSelect={setSelectedFood}
              selectedFoodId={selectedFood?.id}
            />

            {selectedFood && (
              <div className="space-y-3 rounded-lg bg-muted p-3">
                <p className="font-medium">
                  {selectedFood.name}
                </p>

                <div className="space-y-2">
                  <Label htmlFor="recipe-ingredient-quantity">
                    Quantité (g)
                  </Label>

                  <Input
                    id="recipe-ingredient-quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddIngredient}
                  disabled={
                    !Number.isFinite(Number(quantity)) ||
                    Number(quantity) <= 0
                  }
                >
                  <Plus className="size-4" />
                  Ajouter cet ingrédient
                </Button>
              </div>
            )}
          </section>

          {/* LISTE DES INGREDIENTS */}

          <section className="space-y-3">
            <h3 className="font-semibold">
              Ingrédients ({items.length})
            </h3>

            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Aucun ingrédient sélectionné.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.foodId}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {getFoodName(item.foodId)}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {format(item.quantityG)} g
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Retirer ${getFoodName(item.foodId)}`}
                    onClick={() =>
                      handleRemoveIngredient(item.foodId)
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </section>

          {/* VALEURS NUTRITIONNELLES */}

          <section className="space-y-3 rounded-lg bg-muted p-4">
            <h3 className="font-semibold">
              Valeurs nutritionnelles par portion
            </h3>

            {foods.isSuccess ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  {
                    label: 'Calories',
                    value: totals.calories,
                    unit: 'kcal',
                  },
                  {
                    label: 'Protéines',
                    value: totals.protein,
                    unit: 'g',
                  },
                  {
                    label: 'Glucides',
                    value: totals.carbohydrates,
                    unit: 'g',
                  },
                  {
                    label: 'Lipides',
                    value: totals.fat,
                    unit: 'g',
                  },
                  {
                    label: 'Fibres',
                    value: totals.fiber,
                    unit: 'g',
                  },
                ].map((nutrient) => (
                  <div key={nutrient.label}>
                    <p className="text-xs text-muted-foreground">
                      {nutrient.label}
                    </p>

                    <p className="text-lg font-semibold">
                      {format(nutrient.value / portionCount)}{' '}
                      {nutrient.unit}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Estimation indisponible tant que le catalogue
                alimentaire n'est pas chargé.
              </p>
            )}
          </section>

          {/* INSTRUCTIONS */}

          <div className="space-y-2">
            <Label htmlFor="recipe-instructions">
              Instructions de préparation
            </Label>

            <Textarea
              id="recipe-instructions"
              rows={5}
              maxLength={10000}
              value={instructions}
              onChange={(event) =>
                setInstructions(event.target.value)
              }
              placeholder="1. Préparer les ingrédients..."
            />
          </div>

          {/* ERREURS */}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {/* ACTIONS */}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={isPending || items.length === 0}
            >
              {isPending
                ? 'Enregistrement...'
                : isEditing
                  ? 'Enregistrer les modifications'
                  : 'Créer la recette'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
