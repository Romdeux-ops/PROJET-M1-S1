import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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

import type { RecoveryCheckinResponse } from '../../api/recovery-types'

import { useSaveRecoveryCheckin } from '../../hooks/use-recovery-mutations'

import { recoveryCheckinSchema, type RecoveryCheckinInput } from '../../schemas'

interface RecoveryCheckinDialogProps {
  checkin?: RecoveryCheckinResponse | null
  date?: string
}

const LEVEL_FIELDS = [
  {
    name: 'energyLevel',
    label: "Niveau d'énergie",
    minLabel: 'Épuisé',
    maxLabel: 'Pleine énergie',
  },
  {
    name: 'fatigueLevel',
    label: 'Fatigue',
    minLabel: 'Aucune',
    maxLabel: 'Extrême',
  },
  {
    name: 'stressLevel',
    label: 'Stress',
    minLabel: 'Détendu',
    maxLabel: 'Très stressé',
  },
  {
    name: 'muscleSoreness',
    label: 'Courbatures',
    minLabel: 'Aucune',
    maxLabel: 'Très importantes',
  },
] as const

function getDefaultValues(
  checkin?: RecoveryCheckinResponse | null,
  date = todayIso(),
): RecoveryCheckinInput {
  return {
    checkinDate: checkin?.checkinDate ?? date,
    energyLevel: checkin?.energyLevel ?? 5,
    fatigueLevel: checkin?.fatigueLevel ?? 5,
    stressLevel: checkin?.stressLevel ?? 5,
    muscleSoreness: checkin?.muscleSoreness ?? 5,
    notes: checkin?.notes ?? '',
  }
}

export function RecoveryCheckinDialog({ checkin, date }: RecoveryCheckinDialogProps) {
  const [open, setOpen] = useState(false)

  const mutation = useSaveRecoveryCheckin()

  const form = useForm<RecoveryCheckinInput>({
    resolver: zodResolver(recoveryCheckinSchema),
    defaultValues: getDefaultValues(checkin, date),
  })

  const errors = form.formState.errors

  function handleOpenChange(nextOpen: boolean) {
    if (mutation.isPending) return

    if (nextOpen) {
      form.reset(getDefaultValues(checkin, date))
    }

    setOpen(nextOpen)
  }

  async function onSubmit(values: RecoveryCheckinInput) {
    try {
      await mutation.mutateAsync(values)
      setOpen(false)
    } catch {
      // Erreur affichée par le MutationCache.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={checkin ? 'outline' : 'default'}>
          {checkin ? 'Modifier mon ressenti' : 'Questionnaire quotidien'}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Comment vous sentez-vous ?</DialogTitle>

          <DialogDescription>Évaluez votre ressenti sur une échelle de 0 à 10.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={mutation.isPending} className="space-y-5">
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Date</span>

              <Input
                type="date"
                max={todayIso()}
                readOnly={Boolean(checkin || date)}
                {...form.register('checkinDate')}
              />

              {errors.checkinDate && (
                <span className="text-xs text-destructive">{errors.checkinDate.message}</span>
              )}
            </label>

            {LEVEL_FIELDS.map((field) => (
              <label key={field.name} className="block space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{field.label}</span>

                  <span className="font-semibold tabular-nums">{form.watch(field.name)}/10</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  className="w-full cursor-pointer accent-primary"
                  {...form.register(field.name, {
                    valueAsNumber: true,
                  })}
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{field.minLabel}</span>
                  <span>{field.maxLabel}</span>
                </div>

                {errors[field.name] && (
                  <span className="text-xs text-destructive">{errors[field.name]?.message}</span>
                )}
              </label>
            ))}

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Commentaire facultatif</span>

              <Textarea
                rows={3}
                maxLength={2000}
                placeholder="Votre ressenti aujourd'hui..."
                {...form.register('notes')}
              />

              {errors.notes && (
                <span className="text-xs text-destructive">{errors.notes.message}</span>
              )}
            </label>
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
