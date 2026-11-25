import { useState } from 'react'

import { Search } from 'lucide-react'

import { ErrorState } from '@/components/feedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useFoods } from '../hooks/use-foods'

import { foodCategories, FOOD_CATEGORY_LABELS, type Food } from '../schemas'

interface FoodSelectorProps {
  onSelect: (food: Food) => void
  selectedFoodId?: string
}

export function FoodSelector({ onSelect, selectedFoodId }: FoodSelectorProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')

  const foods = useFoods()

  const filteredFoods = (foods.data ?? []).filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.trim().toLowerCase())

    const matchesCategory = category === 'ALL' || food.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="food-search">Rechercher un aliment</Label>

        <div className="relative">
          <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />

          <Input
            id="food-search"
            placeholder="Poulet, riz, banane..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="food-category">Catégorie</Label>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="food-category">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">Toutes les catégories</SelectItem>

            {foodCategories.map((item) => (
              <SelectItem key={item} value={item}>
                {FOOD_CATEGORY_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {foods.isError ? (
        <ErrorState error={foods.error} onRetry={() => void foods.refetch()} />
      ) : foods.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {filteredFoods.length} aliment(s) disponible(s)
          </p>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {filteredFoods.map((food) => (
              <Button
                key={food.id}
                type="button"
                variant={selectedFoodId === food.id ? 'secondary' : 'outline'}
                aria-pressed={selectedFoodId === food.id}
                onClick={() => onSelect(food)}
                className="h-auto w-full justify-start p-3 text-left whitespace-normal"
              >
                <div className="w-full space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{food.name}</span>

                    <span className="text-xs text-muted-foreground">
                      {food.caloriesKcal} kcal / 100 g
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    P : {food.proteinG} g · G : {food.carbohydratesG} g · L : {food.fatG} g
                  </p>
                </div>
              </Button>
            ))}

            {filteredFoods.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun aliment trouvé.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
