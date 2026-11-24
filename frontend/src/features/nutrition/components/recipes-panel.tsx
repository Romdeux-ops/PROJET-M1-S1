
import { useState } from 'react'

import {
  ChefHat,
  Clock,
  Search,
  Trash2,
  Users,
} from 'lucide-react'

import { ErrorState } from '@/components/feedback'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  useDeleteRecipe,
  useRecipes,
} from '../hooks/use-recipes'

import type { Recipe } from '../schemas'

import { RecipeForm } from './recipe-form'

function format(value: number): string {
  return value.toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  })
}

// ======================================================
// VALEURS NUTRITIONNELLES
// ======================================================

function RecipeNutrition({
  recipe,
}: {
  recipe: Recipe
}) {
  const nutrients = [
    {
      label: 'Calories',
      value: recipe.caloriesPerServing,
      unit: 'kcal',
    },
    {
      label: 'Protéines',
      value: recipe.proteinPerServingG,
      unit: 'g',
    },
    {
      label: 'Glucides',
      value: recipe.carbohydratesPerServingG,
      unit: 'g',
    },
    {
      label: 'Lipides',
      value: recipe.fatPerServingG,
      unit: 'g',
    },
    {
      label: 'Fibres',
      value: recipe.fiberPerServingG,
      unit: 'g',
    },
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">
        Valeurs par portion
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {nutrients.map((nutrient) => (
          <div
            key={nutrient.label}
            className="space-y-1 rounded-lg bg-muted p-3"
          >
            <p className="text-xs text-muted-foreground">
              {nutrient.label}
            </p>

            <p className="font-semibold">
              {format(nutrient.value)}{' '}
              {nutrient.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ======================================================
// DETAIL D'UNE RECETTE
// ======================================================

function RecipeDetails({
  recipe,
}: {
  recipe: Recipe
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Consulter
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {recipe.name}
          </DialogTitle>

          <DialogDescription>
            Informations et instructions de préparation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {recipe.description && (
            <p className="text-sm text-muted-foreground">
              {recipe.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <Users className="size-4" />

              {recipe.servings} portion
              {recipe.servings > 1 ? 's' : ''}
            </span>

            {recipe.preparationMinutes != null && (
              <span className="flex items-center gap-2">
                <Clock className="size-4" />
                {recipe.preparationMinutes} min
              </span>
            )}
          </div>

          <RecipeNutrition recipe={recipe} />

          <section className="space-y-3">
            <h3 className="font-semibold">
              Ingrédients
            </h3>

            <p className="text-xs text-muted-foreground">
              Quantités pour la recette entière.
            </p>

            {recipe.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
              >
                <span>{item.foodName}</span>

                <span className="font-medium">
                  {format(item.quantityG)} g
                </span>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold">
              Instructions de préparation
            </h3>

            {recipe.instructions ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {recipe.instructions}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune instruction renseignée.
              </p>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ======================================================
// CARTE D'UNE RECETTE
// ======================================================

function RecipeCard({
  recipe,
}: {
  recipe: Recipe
}) {
  const deleteRecipe = useDeleteRecipe()

  function handleDelete() {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la recette "${recipe.name}" ?`,
    )

    if (confirmed) {
      deleteRecipe.mutate(recipe.id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ChefHat className="size-5 shrink-0" />

          {recipe.name}
        </CardTitle>

        {recipe.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {recipe.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-4" />

            {recipe.servings} portion
            {recipe.servings > 1 ? 's' : ''}
          </span>

          {recipe.preparationMinutes != null && (
            <span className="flex items-center gap-1">
              <Clock className="size-4" />
              {recipe.preparationMinutes} min
            </span>
          )}

          <span>
            {recipe.items.length} ingrédient
            {recipe.items.length > 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <RecipeNutrition recipe={recipe} />

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <RecipeDetails recipe={recipe} />

          <RecipeForm recipe={recipe} />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Supprimer ${recipe.name}`}
            disabled={deleteRecipe.isPending}
            onClick={handleDelete}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>

        {deleteRecipe.isError && (
          <p role="alert" className="text-sm text-destructive">
            {deleteRecipe.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ======================================================
// PANNEAU PRINCIPAL DES RECETTES
// ======================================================

export function RecipesPanel() {
  const [search, setSearch] = useState('')

  const recipes = useRecipes()

  const filteredRecipes = (recipes.data ?? []).filter(
    (recipe) => {
      const query = search.trim().toLowerCase()

      return (
        recipe.name.toLowerCase().includes(query) ||
        (recipe.description ?? '').toLowerCase().includes(query)
      )
    },
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Mes recettes
          </h2>

          <p className="text-sm text-muted-foreground">
            Créez et retrouvez vos recettes personnelles.
          </p>
        </div>

        <RecipeForm />
      </div>

      <div className="max-w-md space-y-2">
        <Label htmlFor="recipe-search">
          Rechercher une recette
        </Label>

        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

          <Input
            id="recipe-search"
            value={search}
            placeholder="Rechercher..."
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="pl-9"
          />
        </div>
      </div>

      {recipes.isError ? (
        <ErrorState
          error={recipes.error}
          onRetry={() => void recipes.refetch()}
        />
      ) : recipes.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <ChefHat className="mx-auto size-10 text-muted-foreground" />

            <p className="font-medium">
              {search.trim()
                ? 'Aucune recette trouvée'
                : 'Aucune recette enregistrée'}
            </p>

            <p className="text-sm text-muted-foreground">
              {search.trim()
                ? 'Essayez une autre recherche.'
                : 'Créez votre première recette personnelle.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filteredRecipes.length} recette
            {filteredRecipes.length > 1 ? 's' : ''}
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
