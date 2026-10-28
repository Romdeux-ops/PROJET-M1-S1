import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2, Trophy } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExercises } from '@/features/catalog'
import { formatDuration } from '@/lib/format'

import { useAddSet, useDeleteSet, useSessionDetail } from '../hooks/use-sessions'
import { type AddSetInput, addSetSchema } from '../schemas'

export function SessionSetsPanel({ sessionId }: { sessionId: string }) {
  const { data: session, isLoading } = useSessionDetail(sessionId)
  const { data: exercises = [] } = useExercises({})
  const addSet = useAddSet(sessionId)
  const deleteSet = useDeleteSet(sessionId)

  const form = useForm<AddSetInput>({
    resolver: zodResolver(addSetSchema),
    defaultValues: {
      exerciseId: '',
      setNumber: 1,
      reps: 8,
      weightKg: 20,
      rpe: undefined,
      restSeconds: 90,
    },
  })

  if (isLoading || !session) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  }

  function handleAddSet(values: AddSetInput) {
    addSet.mutate(values, {
      onSuccess: () => form.reset({ ...values, setNumber: values.setNumber + 1 }),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {session.durationMinutes != null ? formatDuration(session.durationMinutes) : '—'}
        </span>
        <span>Volume total : {session.totalVolume.toLocaleString('fr-FR')} kg</span>
      </div>
      {session.notes && <p className="text-sm">{session.notes}</p>}

      {session.sets.length > 0 && (
        <ul className="space-y-2">
          {session.sets.map((set) => (
            <li
              key={set.id}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {set.exerciseName}
                  {set.isPersonalRecord && (
                    <Badge variant="default" className="ml-2">
                      <Trophy className="size-3" /> PR
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Série {set.setNumber} · {set.weightKg}kg × {set.reps} reps
                  {set.rpe ? ` · RPE ${set.rpe}` : ''}
                  {set.restSeconds ? ` · repos ${set.restSeconds}s` : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={deleteSet.isPending}
                onClick={() => deleteSet.mutate(set.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAddSet)}
          className="grid gap-2 rounded-md border p-3 sm:grid-cols-3"
        >
          <FormField
            control={form.control}
            name="exerciseId"
            render={({ field }) => (
              <FormItem className="sm:col-span-3">
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir un exercice" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {exercises.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="setNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="N° série"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reps"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    placeholder="Répétitions"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.5"
                    placeholder="Charge (kg)"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rpe"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    step="0.5"
                    placeholder="RPE (optionnel)"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? e.target.valueAsNumber : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="restSeconds"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={1200}
                    placeholder="Repos (s)"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? e.target.valueAsNumber : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" disabled={addSet.isPending} className="sm:col-span-3">
            {addSet.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            Ajouter la série
          </Button>
        </form>
      </Form>
    </div>
  )
}
