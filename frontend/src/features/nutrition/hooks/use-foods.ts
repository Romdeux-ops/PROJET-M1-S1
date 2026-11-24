
import { queryOptions, useQuery } from '@tanstack/react-query'

import { nutritionApi } from '../api/nutrition-api'

export const foodKeys = {
  all: ['nutrition', 'foods'] as const,

  list: () => [...foodKeys.all, 'list'] as const,

  detail: (foodId: string) =>
    [...foodKeys.all, 'detail', foodId] as const,

  search: (name: string) =>
    [...foodKeys.all, 'search', name] as const,

  category: (category: string) =>
    [...foodKeys.all, 'category', category] as const,
}

// Catalogue complet
export const foodsQuery = () =>
  queryOptions({
    queryKey: foodKeys.list(),
    queryFn: nutritionApi.listFoods,
    staleTime: 5 * 60 * 1000,
  })

export function useFoods() {
  return useQuery(foodsQuery())
}

// Aliment par identifiant
export function useFood(foodId: string) {
  return useQuery({
    queryKey: foodKeys.detail(foodId),
    queryFn: () => nutritionApi.getFood(foodId),
    enabled: Boolean(foodId),
    staleTime: 5 * 60 * 1000,
  })
}

// Recherche par nom
export function useFoodSearch(name: string) {
  const search = name.trim()

  return useQuery({
    queryKey: foodKeys.search(search),
    queryFn: () => nutritionApi.searchFoods(search),
    enabled: search.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

// Filtrage par categorie
export function useFoodsByCategory(category: string) {
  return useQuery({
    queryKey: foodKeys.category(category),
    queryFn: () => nutritionApi.getFoodsByCategory(category),
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
  })
}
