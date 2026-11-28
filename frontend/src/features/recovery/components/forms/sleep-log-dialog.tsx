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

import type { SleepLogResponse } from '../../api/recovery-types'
import { useCreateSleepLog, useUpdateSleepLog } from '../../hooks/use-recovery-mutations'
import { sleepLogSchema, type SleepLogInput } from '../../schemas'

interface SleepLogDialogProps {
  sleepLog?: SleepLogResponse | null
}

function toLocalDateTime(value: string | Date) {
  const date = new Date(value)

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())

  return date.toISOString().slice(0, 16)
}

function getDefaultValues(sleepLog?: SleepLogResponse | null): SleepLogInput {
  const bedtime = new Date()
  bedtime.setDate(bedtime.getDate() - 1)
  bedtime.setHours(23, 0, 0, 0)

  const wakeTime = new Date()
  wakeTime.setHours(7, 0, 0, 0)

  return {
    bedtime: toLocalDateTime(sleepLog?.bedtime ?? bedtime),
    wakeTime: toLocalDateTime(sleepLog?.wakeTime ?? wakeTime),
    awakeMinutes: sleepLog?.awakeMinutes ?? undefined,
    sleepQuality: sleepLog?.sleepQuality ?? 7,
    nightAwakenings: sleepLog?.nightAwakenings ?? undefined,
    notes: sleepLog?.notes ?? '',
  }
}

export function SleepLogDialog({ sleepLog }: SleepLogDialogProps) {
  const [open, setOpen] = useState(false)

  const createMutation = useCreateSleepLog()
  const updateMutation = useUpdateSleepLog()

  const isEditing = Boolean(sleepLog?.id)

  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<SleepLogInput>({
    resolver: zodResolver(sleepLogSchema),
    defaultValues: getDefaultValues(sleepLog),
  })

  const errors = form.formState.errors

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return

    if (nextOpen) {
      form.reset(getDefaultValues(sleepLog))
    }

    setOpen(nextOpen)
  }

  async function onSubmit(values: SleepLogInput) {
    const body = {
      ...values,
      bedtime: new Date(values.bedtime).toISOString(),
      wakeTime: new Date(values.wakeTime).toISOString(),
    }

    try {
      if (sleepLog?.id) {
        await updateMutation.mutateAsync({
          sleepLogId: sleepLog.id,
          body,
        })
      } else {
        await createMutation.mutateAsync(body)
      }

      setOpen(false)
    } catch {
      // Le MutationCache affiche déjà l'erreur.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? 'outline' : 'default'}>
          {isEditing ? 'Modifier le sommeil' : 'Enregistrer mon sommeil'}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le sommeil' : 'Journal du sommeil'}</DialogTitle>

          <DialogDescription>Renseignez les informations relatives à votre nuit.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isPending} className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Heure de coucher</span>

              <Input type="datetime-local" {...form.register('bedtime')} />

              {errors.bedtime && (
                <span className="text-xs text-destructive">{errors.bedtime.message}</span>
              )}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Heure de réveil</span>

              <Input type="datetime-local" {...form.register('wakeTime')} />

              {errors.wakeTime && (
                <span className="text-xs text-destructive">{errors.wakeTime.message}</span>
              )}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Temps éveillé pendant la nuit (min)</span>

              <Input
                type="number"
                min={0}
                max={1440}
                placeholder="Facultatif"
                {...form.register('awakeMinutes', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                })}
              />

              {errors.awakeMinutes && (
                <span className="text-xs text-destructive">{errors.awakeMinutes.message}</span>
              )}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Qualité du sommeil (1 à 10)</span>

              <Input
                type="number"
                min={1}
                max={10}
                {...form.register('sleepQuality', {
                  valueAsNumber: true,
                })}
              />

              {errors.sleepQuality && (
                <span className="text-xs text-destructive">{errors.sleepQuality.message}</span>
              )}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Nombre de réveils nocturnes</span>

              <Input
                type="number"
                min={0}
                max={100}
                placeholder="Facultatif"
                {...form.register('nightAwakenings', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                })}
              />

              {errors.nightAwakenings && (
                <span className="text-xs text-destructive">{errors.nightAwakenings.message}</span>
              )}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Notes</span>

              <Textarea
                rows={3}
                maxLength={2000}
                placeholder="Comment s'est passée votre nuit ?"
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
