import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { nutritionApi } from '../api/nutrition-api'
import type { AddMealItemInput, MealFilters, UpdateMealItemInput } from '../schemas'

export const mealKeys = {
  all: ['nutrition', 'meals'] as const,

  lists: () => [...mealKeys.all, 'list'] as const,

  list: (filters: MealFilters) => [...mealKeys.lists(), filters.start, filters.end] as const,

  detail: (mealLogId: string) => [...mealKeys.all, 'detail', mealLogId] as const,
}

// Liste des repas sur une periode
export const mealsQuery = (filters: MealFilters) =>
  queryOptions({
    queryKey: mealKeys.list(filters),
    queryFn: () => nutritionApi.listMeals(filters),
    enabled: Boolean(filters.start && filters.end),
  })

export function useMeals(filters: MealFilters) {
  return useQuery(mealsQuery(filters))
}

// Detail d'un repas
export const mealQuery = (mealLogId: string) =>
  queryOptions({
    queryKey: mealKeys.detail(mealLogId),
    queryFn: () => nutritionApi.getMeal(mealLogId),
    enabled: Boolean(mealLogId),
  })

export function useMealDetail(mealLogId: string) {
  return useQuery(mealQuery(mealLogId))
}

// Creation d'un repas
export function useCreateMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nutritionApi.createMeal,

    meta: {
      successMessage: 'Repas enregistré',
    },

    onSuccess: (meal) => {
      queryClient.setQueryData(mealKeys.detail(meal.id), meal)

      return queryClient.invalidateQueries({
        queryKey: mealKeys.lists(),
      })
    },
  })
}

// Ajout d'un aliment a un repas
export function useAddMealItem(mealLogId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddMealItemInput) => nutritionApi.addMealItem(mealLogId, input),

    meta: {
      successMessage: 'Aliment ajouté au repas',
    },

    onSuccess: (meal) => {
      queryClient.setQueryData(mealKeys.detail(mealLogId), meal)

      return queryClient.invalidateQueries({
        queryKey: mealKeys.lists(),
      })
    },
  })
}

// Suppression d'un repas
export function useDeleteMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nutritionApi.deleteMeal,

    meta: {
      successMessage: 'Repas supprimé',
    },

    onSuccess: (_, mealLogId) => {
      queryClient.removeQueries({
        queryKey: mealKeys.detail(mealLogId),
        exact: true,
      })

      return queryClient.invalidateQueries({
        queryKey: mealKeys.lists(),
      })
    },
  })
}

// Modification de la quantité d'un aliment
export function useUpdateMealItem(mealLogId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateMealItemInput }) =>
      nutritionApi.updateMealItem(mealLogId, itemId, input),

    meta: {
      successMessage: 'Quantité modifiée',
    },

    onSuccess: (meal) => {
      queryClient.setQueryData(mealKeys.detail(mealLogId), meal)

      return queryClient.invalidateQueries({
        queryKey: mealKeys.lists(),
      })
    },
  })
}

// Suppression individuelle d'un aliment
export function useDeleteMealItem(mealLogId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => nutritionApi.deleteMealItem(mealLogId, itemId),

    meta: {
      successMessage: 'Aliment supprimé du repas',
    },

    onSuccess: (meal) => {
      queryClient.setQueryData(mealKeys.detail(mealLogId), meal)

      return queryClient.invalidateQueries({
        queryKey: mealKeys.lists(),
      })
    },
  })
}
