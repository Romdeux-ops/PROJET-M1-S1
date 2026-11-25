import { useState, type FormEvent } from 'react'

import { Plus } from 'lucide-react'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useAddMealItem, useCreateMeal } from '../hooks/use-meals'

import {
  addMealItemSchema,
  createMealSchema,
  mealTypes,
  MEAL_TYPE_LABELS,
  type Food,
  type MealType,
} from '../schemas'

import { FoodSelector } from './food-selector'

// ======================================================
// CREATION D'UN REPAS
// ======================================================

interface MealFormProps {
  selectedDate: string
}

export function MealForm({ selectedDate }: MealFormProps) {
  const [open, setOpen] = useState(false)
  const [mealType, setMealType] = useState<MealType>('LUNCH')
  const [time, setTime] = useState('12:00')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const createMeal = useCreateMeal()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const result = createMealSchema.safeParse({
      mealType,
      consumedAt: `${selectedDate}T${time}:00`,
      notes,
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Données invalides')
      return
    }

    createMeal.mutate(result.data, {
      onSuccess: () => {
        setNotes('')
        setOpen(false)
      },
      onError: (mutationError) => {
        setError(mutationError.message)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Ajouter un repas
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau repas</DialogTitle>

          <DialogDescription>
            Enregistrez un repas dans votre journal alimentaire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-type">Type de repas</Label>

            <Select
              value={mealType}
              onValueChange={(value: string) => setMealType(value as MealType)}
            >
              <SelectTrigger id="meal-type">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {mealTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {MEAL_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-date">Date</Label>

              <Input id="meal-date" type="date" value={selectedDate} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-time">Heure</Label>

              <Input
                id="meal-time"
                type="time"
                value={time}
                required
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-notes">Notes (facultatif)</Label>

            <Textarea
              id="meal-notes"
              value={notes}
              maxLength={2000}
              placeholder="Informations complémentaires..."
              onChange={(event) => setNotes(event.target.value)}
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
              onClick={() => setOpen(false)}
              disabled={createMeal.isPending}
            >
              Annuler
            </Button>

            <Button type="submit" disabled={createMeal.isPending}>
              {createMeal.isPending ? 'Enregistrement...' : 'Créer le repas'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ======================================================
// AJOUT D'UN ALIMENT
// ======================================================

interface AddMealItemFormProps {
  mealLogId: string
}

export function AddMealItemForm({ mealLogId }: AddMealItemFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [error, setError] = useState('')

  const addMealItem = useAddMealItem(mealLogId)

  const quantityG = Number(quantity)

  const factor = Number.isFinite(quantityG) && quantityG > 0 ? quantityG / 100 : 0

  function format(value: number): string {
    return value.toLocaleString('fr-FR', {
      maximumFractionDigits: 2,
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const result = addMealItemSchema.safeParse({
      foodId: selectedFood?.id ?? '',
      quantityG,
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Données invalides')
      return
    }

    addMealItem.mutate(result.data, {
      onSuccess: () => {
        setSelectedFood(null)
        setQuantity('100')
        setOpen(false)
      },
      onError: (mutationError) => {
        setError(mutationError.message)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" />
          Ajouter un aliment
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un aliment</DialogTitle>

          <DialogDescription>
            Sélectionnez un aliment et indiquez la quantité consommée.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FoodSelector onSelect={setSelectedFood} selectedFoodId={selectedFood?.id} />

          {selectedFood && (
            <div className="space-y-4 rounded-lg border p-4">
              <p className="font-medium">{selectedFood.name}</p>

              <div className="space-y-2">
                <Label htmlFor="food-quantity">Quantité (g)</Label>

                <Input
                  id="food-quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Calories</p>
                  <p className="font-semibold">{format(selectedFood.caloriesKcal * factor)} kcal</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Protéines</p>
                  <p className="font-semibold">{format(selectedFood.proteinG * factor)} g</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Glucides</p>
                  <p className="font-semibold">{format(selectedFood.carbohydratesG * factor)} g</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Lipides</p>
                  <p className="font-semibold">{format(selectedFood.fatG * factor)} g</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Fibres</p>
                  <p className="font-semibold">{format(selectedFood.fiberG * factor)} g</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={addMealItem.isPending}
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={
                !selectedFood ||
                !Number.isFinite(quantityG) ||
                quantityG <= 0 ||
                addMealItem.isPending
              }
            >
              {addMealItem.isPending ? 'Ajout...' : 'Ajouter au repas'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
