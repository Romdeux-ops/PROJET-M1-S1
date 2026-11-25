
import { z } from 'zod'

// ======================================================
// CONSTANTES
// ======================================================

export const mealTypes = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
] as const

export type MealType = (typeof mealTypes)[number]

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Collation',
}

export const foodCategories = [
  'MEAT',
  'FISH',
  'DAIRY_EGGS',
  'GRAINS',
  'VEGETABLES',
  'FRUITS',
  'LEGUMES',
  'FATS',
] as const

export type FoodCategory = (typeof foodCategories)[number]

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  MEAT: 'Viandes',
  FISH: 'Poissons',
  DAIRY_EGGS: 'Produits laitiers et œufs',
  GRAINS: 'Céréales et féculents',
  VEGETABLES: 'Légumes',
  FRUITS: 'Fruits',
  LEGUMES: 'Légumineuses',
  FATS: 'Matières grasses et oléagineux',
}

// ======================================================
// VALEURS NUTRITIONNELLES
// ======================================================

export interface NutritionValues {
  caloriesKcal: number
  proteinG: number
  carbohydratesG: number
  fatG: number
  fiberG: number
}

// ======================================================
// ALIMENTS
// ======================================================

export interface Food extends NutritionValues {
  id: string
  name: string
  category: string
}

// ======================================================
// REPAS
// ======================================================

export interface MealLogItem extends NutritionValues {
  id: string
  foodId: string
  foodName: string
  quantityG: number
}

export interface MealLog {
  id: string
  mealType: MealType
  consumedAt: string
  notes?: string | null
  items: MealLogItem[]
  createdAt: string
}

export interface MealFilters {
  start: string
  end: string
}

export const createMealSchema = z.object({
  mealType: z.enum(mealTypes),
  consumedAt: z.string().min(1, 'Date requise'),
  notes: z
    .string()
    .trim()
    .max(2000, '2000 caractères maximum')
    .optional(),
})

export type CreateMealInput = z.infer<typeof createMealSchema>

export const addMealItemSchema = z.object({
  foodId: z.string().uuid('Choisissez un aliment valide'),
  quantityG: z.number().positive('La quantité doit être positive'),
})

export type AddMealItemInput = z.infer<typeof addMealItemSchema>

// ======================================================
// OBJECTIFS NUTRITIONNELS
// ======================================================

export interface NutritionPlan {
  id: string
  caloriesGoal: number
  proteinGoalG: number
  carbohydratesGoalG: number
  fatGoalG: number
  fiberGoalG?: number | null
  validFrom: string
  validTo?: string | null
}

export const createNutritionPlanSchema = z
  .object({
    caloriesGoal: z
      .number()
      .positive('Les calories doivent être positives'),

    proteinGoalG: z
      .number()
      .min(0, 'La valeur doit être positive ou nulle'),

    carbohydratesGoalG: z
      .number()
      .min(0, 'La valeur doit être positive ou nulle'),

    fatGoalG: z
      .number()
      .min(0, 'La valeur doit être positive ou nulle'),

    fiberGoalG: z
      .number()
      .min(0, 'La valeur doit être positive ou nulle'),

    validFrom: z.iso.date(),

    validTo: z.iso.date().optional(),
  })
  .refine(
    (data) => !data.validTo || data.validTo >= data.validFrom,
    {
      message: 'La date de fin doit être postérieure ou égale à la date de début',
      path: ['validTo'],
    },
  )

export type CreateNutritionPlanInput = z.infer<
  typeof createNutritionPlanSchema
>

// ======================================================
// RECETTES
// ======================================================

export interface RecipeItem extends NutritionValues {
  id: string
  foodId: string
  foodName: string
  quantityG: number
}

export interface Recipe {
  id: string
  name: string
  description?: string | null
  servings: number
  preparationMinutes?: number | null
  instructions?: string | null
  items: RecipeItem[]
  caloriesPerServing: number
  proteinPerServingG: number
  carbohydratesPerServingG: number
  fatPerServingG: number
  fiberPerServingG: number
  createdAt: string
  updatedAt: string
}

export const recipeItemSchema = z.object({
  foodId: z.string().uuid('Choisissez un aliment valide'),
  quantityG: z.number().positive('La quantité doit être positive'),
})

export type RecipeItemInput = z.infer<typeof recipeItemSchema>

export const recipeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire')
    .max(200, '200 caractères maximum'),

  description: z
    .string()
    .trim()
    .max(2000, '2000 caractères maximum')
    .optional(),

  servings: z
    .number()
    .int()
    .positive('Au moins une portion est nécessaire'),

  preparationMinutes: z
    .number()
    .int()
    .positive('La durée doit être positive')
    .optional(),

  instructions: z
    .string()
    .trim()
    .max(10000, '10000 caractères maximum')
    .optional(),

  items: z
    .array(recipeItemSchema)
    .min(1, 'Ajoutez au moins un ingrédient'),
})

export type RecipeInput = z.infer<typeof recipeSchema>

export const updateMealItemSchema = z.object({
  quantityG: z
    .number()
    .min(0.01, 'La quantité minimale est de 0,01 g')
    .max(999999.99, 'La quantité est trop élevée')
    .multipleOf(0.01, 'Deux décimales maximum'),
})

export type UpdateMealItemInput = z.infer<
  typeof updateMealItemSchema
>