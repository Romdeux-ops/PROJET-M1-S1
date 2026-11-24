
import { useState, type FormEvent } from 'react'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { useCreateNutritionPlan } from '../hooks/use-nutrition-plans'
import { createNutritionPlanSchema } from '../schemas'

interface NutritionPlanFormProps {
  selectedDate: string
}

export function NutritionPlanForm({
  selectedDate,
}: NutritionPlanFormProps) {
  const [open, setOpen] = useState(false)

  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbohydrates, setCarbohydrates] = useState('')
  const [fat, setFat] = useState('')
  const [fiber, setFiber] = useState('')

  const [validFrom, setValidFrom] = useState(selectedDate)
  const [validTo, setValidTo] = useState('')

  const [error, setError] = useState('')

  const createPlan = useCreateNutritionPlan()

  const estimatedCalories =
    Number(protein) * 4 +
    Number(carbohydrates) * 4 +
    Number(fat) * 9

  function handleOpenChange(value: boolean) {
    if (value) {
      setValidFrom(selectedDate)
      setError('')
    }

    setOpen(value)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const result = createNutritionPlanSchema.safeParse({
      caloriesGoal: Number(calories),
      proteinGoalG: Number(protein),
      carbohydratesGoalG: Number(carbohydrates),
      fatGoalG: Number(fat),
      fiberGoalG: Number(fiber),
      validFrom,
      validTo: validTo || undefined,
    })

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          'Les données sont invalides.',
      )
      return
    }

    createPlan.mutate(result.data, {
      onSuccess: () => {
        setOpen(false)
        setError('')
      },

      onError: (mutationError) => {
        setError(mutationError.message)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nouvel objectif
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Nouvel objectif nutritionnel
          </DialogTitle>

          <DialogDescription>
            Définissez vos objectifs journaliers et leur
            période de validité.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="plan-calories">
              Calories journalières (kcal)
            </Label>

            <Input
              id="plan-calories"
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="2200"
              value={calories}
              onChange={(event) =>
                setCalories(event.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-protein">
                Protéines (g)
              </Label>

              <Input
                id="plan-protein"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="150"
                value={protein}
                onChange={(event) =>
                  setProtein(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-carbohydrates">
                Glucides (g)
              </Label>

              <Input
                id="plan-carbohydrates"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="265"
                value={carbohydrates}
                onChange={(event) =>
                  setCarbohydrates(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-fat">
                Lipides (g)
              </Label>

              <Input
                id="plan-fat"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="60"
                value={fat}
                onChange={(event) =>
                  setFat(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-fiber">
                Fibres (g)
              </Label>

              <Input
                id="plan-fiber"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="30"
                value={fiber}
                onChange={(event) =>
                  setFiber(event.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">
              Apport énergétique estimé
            </p>

            <p className="text-xl font-semibold">
              {estimatedCalories.toLocaleString('fr-FR', {
                maximumFractionDigits: 2,
              })}{' '}
              kcal
            </p>

            <p className="text-xs text-muted-foreground">
              Estimation calculée à partir des protéines,
              glucides et lipides renseignés.
            </p>

            {Number(calories) > 0 &&
              Math.abs(
                estimatedCalories - Number(calories),
              ) > 100 && (
                <p className="text-xs text-amber-600">
                  Les calories estimées diffèrent de votre
                  objectif calorique de plus de 100 kcal.
                </p>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-valid-from">
                Date de début
              </Label>

              <Input
                id="plan-valid-from"
                type="date"
                required
                value={validFrom}
                onChange={(event) =>
                  setValidFrom(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-valid-to">
                Date de fin
              </Label>

              <Input
                id="plan-valid-to"
                type="date"
                min={validFrom}
                value={validTo}
                onChange={(event) =>
                  setValidTo(event.target.value)
                }
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            La date de fin est facultative. Sans date de fin,
            l'objectif n'a pas de date d'expiration définie.
          </p>

          {error && (
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={createPlan.isPending}
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={createPlan.isPending}
            >
              {createPlan.isPending
                ? 'Enregistrement...'
                : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
