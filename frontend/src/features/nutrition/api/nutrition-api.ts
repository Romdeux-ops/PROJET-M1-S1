import { api, unwrap } from '@/lib/api/client'

import type {
  AddMealItemInput,
  CreateMealInput,
  CreateNutritionPlanInput,
  Food,
  MealFilters,
  MealLog,
  NutritionPlan,
  Recipe,
  RecipeInput,
  UpdateMealItemInput,
} from '../schemas'

// ======================================================
// CONVERSION DES FORMULAIRES
// ======================================================

function toMealBody(input: CreateMealInput) {
  return {
    mealType: input.mealType,
    consumedAt: new Date(input.consumedAt).toISOString(),
    notes: input.notes || undefined,
  }
}

function toPlanBody(input: CreateNutritionPlanInput) {
  return {
    caloriesGoal: input.caloriesGoal,
    proteinGoalG: input.proteinGoalG,
    carbohydratesGoalG: input.carbohydratesGoalG,
    fatGoalG: input.fatGoalG,
    fiberGoalG: input.fiberGoalG,
    validFrom: input.validFrom,
    validTo: input.validTo || undefined,
  }
}

function toRecipeBody(input: RecipeInput) {
  return {
    name: input.name,
    description: input.description || undefined,
    servings: input.servings,
    preparationMinutes: input.preparationMinutes,
    instructions: input.instructions || undefined,
    items: input.items,
  }
}

// ======================================================
// API NUTRITION
// ======================================================

export const nutritionApi = {
  // --------------------------------------------------
  // ALIMENTS
  // --------------------------------------------------

  listFoods: () => unwrap(api.GET('/api/nutrition/foods')) as Promise<Food[]>,

  getFood: (foodId: string) =>
    unwrap(
      api.GET('/api/nutrition/foods/{foodId}', {
        params: {
          path: { foodId },
        },
      }),
    ) as Promise<Food>,

  searchFoods: (name: string) =>
    unwrap(
      api.GET('/api/nutrition/foods/search', {
        params: {
          query: { name },
        },
      }),
    ) as Promise<Food[]>,

  getFoodsByCategory: (name: string) =>
    unwrap(
      api.GET('/api/nutrition/foods/category', {
        params: {
          query: { name },
        },
      }),
    ) as Promise<Food[]>,

  // --------------------------------------------------
  // JOURNAL ALIMENTAIRE
  // --------------------------------------------------

  listMeals: (filters: MealFilters) =>
    unwrap(
      api.GET('/api/nutrition/meals', {
        params: {
          query: {
            start: filters.start,
            end: filters.end,
          },
        },
      }),
    ) as Promise<MealLog[]>,

  getMeal: (mealLogId: string) =>
    unwrap(
      api.GET('/api/nutrition/meals/{mealLogId}', {
        params: {
          path: { mealLogId },
        },
      }),
    ) as Promise<MealLog>,

  createMeal: (input: CreateMealInput) =>
    unwrap(
      api.POST('/api/nutrition/meals', {
        body: toMealBody(input),
      }),
    ) as Promise<MealLog>,

  addMealItem: (mealLogId: string, input: AddMealItemInput) =>
    unwrap(
      api.POST('/api/nutrition/meals/{mealLogId}/items', {
        params: {
          path: { mealLogId },
        },
        body: input,
      }),
    ) as Promise<MealLog>,
  updateMealItem: (mealLogId: string, itemId: string, input: UpdateMealItemInput) =>
    unwrap(
      api.PUT('/api/nutrition/meals/{mealLogId}/items/{itemId}', {
        params: {
          path: { mealLogId, itemId },
        },
        body: input,
      }),
    ) as Promise<MealLog>,

  deleteMealItem: (mealLogId: string, itemId: string) =>
    unwrap(
      api.DELETE('/api/nutrition/meals/{mealLogId}/items/{itemId}', {
        params: {
          path: { mealLogId, itemId },
        },
      }),
    ) as Promise<MealLog>,

  deleteMeal: (mealLogId: string) =>
    unwrap(
      api.DELETE('/api/nutrition/meals/{mealLogId}', {
        params: {
          path: { mealLogId },
        },
      }),
    ),

  // --------------------------------------------------
  // OBJECTIFS NUTRITIONNELS
  // --------------------------------------------------

  listPlans: () => unwrap(api.GET('/api/nutrition/plans')) as Promise<NutritionPlan[]>,

  getCurrentPlan: async (): Promise<NutritionPlan | null> => {
    const result = await api.GET('/api/nutrition/plans/current')

    if (result.response.status === 404) {
      return null
    }

    const data = await unwrap(Promise.resolve(result))

    return (data as NutritionPlan | undefined) ?? null
  },

  getPlanByDate: async (date: string): Promise<NutritionPlan | null> => {
    const result = await api.GET('/api/nutrition/plans/by-date', {
      params: {
        query: { date },
      },
    })

    if (result.response.status === 404) {
      return null
    }

    const data = await unwrap(Promise.resolve(result))

    return (data as NutritionPlan | undefined) ?? null
  },

  createPlan: (input: CreateNutritionPlanInput) =>
    unwrap(
      api.POST('/api/nutrition/plans', {
        body: toPlanBody(input),
      }),
    ) as Promise<NutritionPlan>,

  // --------------------------------------------------
  // RECETTES
  // --------------------------------------------------

  listRecipes: () => unwrap(api.GET('/api/nutrition/recipes')) as Promise<Recipe[]>,

  getRecipe: (recipeId: string) =>
    unwrap(
      api.GET('/api/nutrition/recipes/{recipeId}', {
        params: {
          path: { recipeId },
        },
      }),
    ) as Promise<Recipe>,

  createRecipe: (input: RecipeInput) =>
    unwrap(
      api.POST('/api/nutrition/recipes', {
        body: toRecipeBody(input),
      }),
    ) as Promise<Recipe>,

  updateRecipe: (recipeId: string, input: RecipeInput) =>
    unwrap(
      api.PUT('/api/nutrition/recipes/{recipeId}', {
        params: {
          path: { recipeId },
        },
        body: toRecipeBody(input),
      }),
    ) as Promise<Recipe>,

  deleteRecipe: (recipeId: string) =>
    unwrap(
      api.DELETE('/api/nutrition/recipes/{recipeId}', {
        params: {
          path: { recipeId },
        },
      }),
    ),
}
