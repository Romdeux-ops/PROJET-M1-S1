import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings } from 'lucide-react'

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

import type { RecoverySettingsResponse } from '../../api/recovery-types'

import { useUpdateRecoverySettings } from '../../hooks/use-recovery-mutations'

import { recoverySettingsSchema, type RecoverySettingsInput } from '../../schemas'

import { formatRecoveryDuration } from '../../utils/recovery-format'

interface RecoverySettingsDialogProps {
  settings?: RecoverySettingsResponse | null
}

export function RecoverySettingsDialog({ settings }: RecoverySettingsDialogProps) {
  const [open, setOpen] = useState(false)

  const mutation = useUpdateRecoverySettings()

  const form = useForm<RecoverySettingsInput>({
    resolver: zodResolver(recoverySettingsSchema),
    defaultValues: {
      sleepTargetMinutes: settings?.sleepTargetMinutes ?? 480,
    },
  })

  const errors = form.formState.errors

  function handleOpenChange(nextOpen: boolean) {
    if (mutation.isPending) return

    if (nextOpen) {
      form.reset({
        sleepTargetMinutes: settings?.sleepTargetMinutes ?? 480,
      })
    }

    setOpen(nextOpen)
  }

  async function onSubmit(values: RecoverySettingsInput) {
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
        <Button variant="outline">
          <Settings className="mr-2 size-4" />
          Paramètres
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paramètres de récupération</DialogTitle>

          <DialogDescription>Personnalisez votre objectif quotidien de sommeil.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={mutation.isPending} className="space-y-4">
            <div className="rounded-xl bg-muted p-5 text-center">
              <p className="text-sm text-muted-foreground">Objectif quotidien</p>

              <p className="mt-2 text-3xl font-bold tabular-nums">
                {formatRecoveryDuration(form.watch('sleepTargetMinutes'))}
              </p>
            </div>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Objectif de sommeil en minutes</span>

              <Input
                type="number"
                min={240}
                max={720}
                step={1}
                {...form.register('sleepTargetMinutes', {
                  valueAsNumber: true,
                })}
              />

              {errors.sleepTargetMinutes && (
                <span className="text-xs text-destructive">
                  {errors.sleepTargetMinutes.message}
                </span>
              )}
            </label>

            <div className="flex flex-wrap gap-2">
              {[360, 420, 480, 540, 600].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  size="sm"
                  variant={form.watch('sleepTargetMinutes') === minutes ? 'default' : 'outline'}
                  onClick={() =>
                    form.setValue('sleepTargetMinutes', minutes, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  {minutes / 60} h
                </Button>
              ))}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Cet objectif sert de référence au calcul du Sleep Score. Sa modification entraîne le
              recalcul des évaluations concernées.
            </p>
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
