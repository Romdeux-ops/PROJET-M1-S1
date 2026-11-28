import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { ACTIVITY_LABELS, type RecoveryWorkoutResponse } from '../../api/recovery-types'

import { useSaveRecoveryWorkoutDetails } from '../../hooks/use-recovery-mutations'

import {
  activityTypes,
  recoveryWorkoutDetailsSchema,
  type RecoveryWorkoutDetailsInput,
} from '../../schemas'

import { formatRecoveryDuration, formatRecoveryNumber } from '../../utils/recovery-format'

interface WorkoutDetailsDialogProps {
  workout: RecoveryWorkoutResponse
}

function getDefaultValues(workout: RecoveryWorkoutResponse): RecoveryWorkoutDetailsInput {
  return {
    activityType: workout.activityType ?? undefined,
    sessionRpe: workout.sessionRpe ?? undefined,
  }
}

export function WorkoutDetailsDialog({ workout }: WorkoutDetailsDialogProps) {
  const [open, setOpen] = useState(false)

  const mutation = useSaveRecoveryWorkoutDetails()

  const form = useForm<RecoveryWorkoutDetailsInput>({
    resolver: zodResolver(recoveryWorkoutDetailsSchema),
    defaultValues: getDefaultValues(workout),
  })

  const errors = form.formState.errors

  function handleOpenChange(nextOpen: boolean) {
    if (mutation.isPending) return

    if (nextOpen) {
      form.reset(getDefaultValues(workout))
    }

    setOpen(nextOpen)
  }

  async function onSubmit(values: RecoveryWorkoutDetailsInput) {
    if (!workout.workoutSessionId) return

    try {
      await mutation.mutateAsync({
        workoutSessionId: workout.workoutSessionId,
        body: values,
      })

      setOpen(false)
    } catch {
      // Erreur affichée par le MutationCache.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!workout.workoutSessionId}>
          Compléter la séance
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informations d'entraînement</DialogTitle>

          <DialogDescription>
            Complétez les informations nécessaires aux indicateurs de récupération.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg bg-muted p-4">
          <p className="font-medium">{workout.title ?? 'Séance sportive'}</p>

          <p className="text-sm text-muted-foreground">
            Durée : {formatRecoveryDuration(workout.durationMinutes)}
          </p>

          <p className="text-sm text-muted-foreground">
            RPE moyen des séries : {formatRecoveryNumber(workout.averageSetRpe)}
          </p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={mutation.isPending} className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Type d'activité</span>

              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register('activityType', {
                  setValueAs: (value) => (value === '' ? undefined : value),
                })}
              >
                <option value="">Non renseigné</option>

                {activityTypes.map((activity) => (
                  <option key={activity} value={activity}>
                    {ACTIVITY_LABELS[activity]}
                  </option>
                ))}
              </select>

              {errors.activityType && (
                <span className="text-xs text-destructive">{errors.activityType.message}</span>
              )}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Effort ressenti de la séance (RPE)</span>

              <Input
                type="number"
                min={1}
                max={10}
                step={0.1}
                placeholder="Facultatif"
                {...form.register('sessionRpe', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                })}
              />

              {errors.sessionRpe && (
                <span className="text-xs text-destructive">{errors.sessionRpe.message}</span>
              )}
            </label>

            <div className="rounded-lg border p-3 text-xs leading-relaxed text-muted-foreground">
              <p>1 à 3 : effort faible.</p>
              <p>4 à 6 : effort modéré.</p>
              <p>7 à 10 : effort élevé à maximal.</p>

              <p className="mt-2">
                Si le RPE de la séance n'est pas renseigné, le modèle utilise le RPE moyen des
                séries lorsqu'il est disponible.
              </p>
            </div>
          </fieldset>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
