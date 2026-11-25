import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { nutritionApi } from '../api/nutrition-api'

export const nutritionPlanKeys = {
  all: ['nutrition', 'plans'] as const,

  list: () => [...nutritionPlanKeys.all, 'list'] as const,

  current: () => [...nutritionPlanKeys.all, 'current'] as const,

  byDate: (date: string) => [...nutritionPlanKeys.all, 'by-date', date] as const,
}

// Liste des objectifs
export const nutritionPlansQuery = () =>
  queryOptions({
    queryKey: nutritionPlanKeys.list(),
    queryFn: nutritionApi.listPlans,
  })

export function useNutritionPlans() {
  return useQuery(nutritionPlansQuery())
}

// Objectif actuel
export const currentNutritionPlanQuery = () =>
  queryOptions({
    queryKey: nutritionPlanKeys.current(),
    queryFn: nutritionApi.getCurrentPlan,
  })

export function useCurrentNutritionPlan() {
  return useQuery(currentNutritionPlanQuery())
}

// Objectif applicable a une date
export function useNutritionPlanByDate(date: string) {
  return useQuery({
    queryKey: nutritionPlanKeys.byDate(date),
    queryFn: () => nutritionApi.getPlanByDate(date),
    enabled: Boolean(date),
  })
}

// Creation d'un objectif
export function useCreateNutritionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nutritionApi.createPlan,

    meta: {
      successMessage: 'Objectif nutritionnel enregistré',
    },

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: nutritionPlanKeys.all,
      }),
  })
}
