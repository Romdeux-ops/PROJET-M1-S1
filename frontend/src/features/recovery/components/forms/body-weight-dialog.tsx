import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Scale } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { todayIso } from '@/lib/format'

import type { BodyWeightResponse } from '../../api/recovery-types'

import { useSaveBodyWeight, useRefreshRecoveryOverview } from '../../hooks/use-recovery-mutations'

import { bodyWeightSchema, type BodyWeightInput } from '../../schemas'

interface BodyWeightDialogProps {
  measurement?: BodyWeightResponse | null
  currentWeightKg?: number | null
}

function getDefaultValues(
  measurement?: BodyWeightResponse | null,
  currentWeightKg?: number | null,
): BodyWeightInput {
  return {
    measuredOn: measurement?.measuredOn ?? todayIso(),
    weightKg: measurement?.weightKg ?? currentWeightKg ?? 0,
    note: measurement?.note ?? '',
  }
}

export function BodyWeightDialog({ measurement, currentWeightKg }: BodyWeightDialogProps) {
  const [open, setOpen] = useState(false)

  const mutation = useSaveBodyWeight()
  const refreshMutation = useRefreshRecoveryOverview()

  const isPending = mutation.isPending || refreshMutation.isPending

  const form = useForm<BodyWeightInput>({
    resolver: zodResolver(bodyWeightSchema),
    defaultValues: getDefaultValues(measurement, currentWeightKg),
  })

  const errors = form.formState.errors

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return

    if (nextOpen) {
      form.reset(getDefaultValues(measurement, currentWeightKg))
    }

    setOpen(nextOpen)
  }

  async function onSubmit(values: BodyWeightInput) {
    const { measuredOn, ...body } = values

    try {
      await mutation.mutateAsync({
        date: measuredOn,
        body,
      })
    } catch {
      return
    }

    // La mesure est enregistrée même si le recalcul échoue.
    setOpen(false)

    try {
      await refreshMutation.mutateAsync()
    } catch {
      // Le poids reste enregistré.
      // L'utilisateur pourra relancer l'actualisation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          <Scale className="mr-2 size-4" />

          {measurement ? 'Modifier la mesure' : 'Enregistrer mon poids'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{measurement ? 'Modifier le poids' : 'Suivi du poids'}</DialogTitle>

          <DialogDescription>Enregistrez une mesure de votre poids corporel.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isPending} className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Date de mesure</span>

              <Input
                type="date"
                max={todayIso()}
                readOnly={Boolean(measurement)}
                {...form.register('measuredOn')}
              />

              {errors.measuredOn && (
                <span className="text-xs text-destructive">{errors.measuredOn.message}</span>
              )}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Poids (kg)</span>

              <Input
                type="number"
                min={0.01}
                max={499.99}
                step={0.01}
                {...form.register('weightKg', {
                  valueAsNumber: true,
                })}
              />

              {errors.weightKg && (
                <span className="text-xs text-destructive">{errors.weightKg.message}</span>
              )}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Commentaire facultatif</span>

              <Textarea
                rows={3}
                maxLength={2000}
                placeholder="Conditions de la mesure..."
                {...form.register('note')}
              />

              {errors.note && (
                <span className="text-xs text-destructive">{errors.note.message}</span>
              )}
            </label>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Votre poids est notamment utilisé pour estimer les dépenses énergétiques de vos
              entraînements. Une seule mesure est conservée par date.
            </p>
          </fieldset>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
