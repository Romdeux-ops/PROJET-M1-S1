import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { nutritionApi } from '../api/nutrition-api'
import type { RecipeInput } from '../schemas'

export const recipeKeys = {
  all: ['nutrition', 'recipes'] as const,

  list: () => [...recipeKeys.all, 'list'] as const,

  detail: (recipeId: string) => [...recipeKeys.all, 'detail', recipeId] as const,
}

// Liste des recettes
export const recipesQuery = () =>
  queryOptions({
    queryKey: recipeKeys.list(),
    queryFn: nutritionApi.listRecipes,
  })

export function useRecipes() {
  return useQuery(recipesQuery())
}

// Detail d'une recette
export const recipeQuery = (recipeId: string) =>
  queryOptions({
    queryKey: recipeKeys.detail(recipeId),
    queryFn: () => nutritionApi.getRecipe(recipeId),
    enabled: Boolean(recipeId),
  })

export function useRecipeDetail(recipeId: string) {
  return useQuery(recipeQuery(recipeId))
}

// Creation d'une recette
export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nutritionApi.createRecipe,

    meta: {
      successMessage: 'Recette créée',
    },

    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe)

      return queryClient.invalidateQueries({
        queryKey: recipeKeys.list(),
      })
    },
  })
}

// Modification d'une recette
export function useUpdateRecipe(recipeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RecipeInput) => nutritionApi.updateRecipe(recipeId, input),

    meta: {
      successMessage: 'Recette modifiée',
    },

    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.detail(recipeId), recipe)

      return queryClient.invalidateQueries({
        queryKey: recipeKeys.list(),
      })
    },
  })
}

// Suppression d'une recette
export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nutritionApi.deleteRecipe,

    meta: {
      successMessage: 'Recette supprimée',
    },

    onSuccess: (_, recipeId) => {
      queryClient.removeQueries({
        queryKey: recipeKeys.detail(recipeId),
        exact: true,
      })

      return queryClient.invalidateQueries({
        queryKey: recipeKeys.list(),
      })
    },
  })
}
