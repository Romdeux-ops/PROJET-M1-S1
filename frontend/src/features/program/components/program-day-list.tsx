import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useExercises } from '@/features/catalog'

import {
  useAddDay,
  useAddExercise,
  useDeleteDay,
  useDeleteExerciseEntry,
} from '../hooks/use-programs'
import { type Program, dayFormSchema, exerciseEntryFormSchema } from '../schemas'

export function ProgramDayList({ program, canManage }: { program: Program; canManage: boolean }) {
  const addDay = useAddDay(program.id)
  const deleteDay = useDeleteDay(program.id)

  const dayForm = useForm({
    resolver: zodResolver(dayFormSchema),
    defaultValues: { name: '', restDay: false },
  })

  return (
    <div className="space-y-4">
      {program.days.map((day) => (
        <Card key={day.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              {day.name}
              {day.restDay && <Badge variant="secondary">Repos</Badge>}
            </CardTitle>
            {canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={deleteDay.isPending}
                onClick={() => deleteDay.mutate(day.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {day.exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun exercice pour ce jour.</p>
            ) : (
              <ul className="space-y-2">
                {day.exercises.map((entry) => (
                  <ExerciseEntryRow
                    key={entry.id}
                    programId={program.id}
                    dayId={day.id}
                    entry={entry}
                    canManage={canManage}
                  />
                ))}
              </ul>
            )}
            {canManage && !day.restDay && <AddExerciseForm programId={program.id} dayId={day.id} />}
          </CardContent>
        </Card>
      ))}

      {canManage && (
        <Card>
          <CardContent className="pt-6">
            <Form {...dayForm}>
              <form
                onSubmit={dayForm.handleSubmit((values) =>
                  addDay.mutate(values, { onSuccess: () => dayForm.reset() }),
                )}
                className="flex flex-wrap items-end gap-3"
              >
                <FormField
                  control={dayForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[200px]">
                      <FormControl>
                        <Input placeholder="Nom du jour (ex: Jour 1 - Haut du corps)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={dayForm.control}
                  name="restDay"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0 pb-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input accent-primary"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <span className="text-sm">Jour de repos</span>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={addDay.isPending}>
                  {addDay.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  Ajouter un jour
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ExerciseEntryRow({
  programId,
  dayId,
  entry,
  canManage,
}: {
  programId: string
  dayId: string
  entry: Program['days'][number]['exercises'][number]
  canManage: boolean
}) {
  const deleteExercise = useDeleteExerciseEntry(programId)

  return (
    <li className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
      <div>
        <p className="font-medium">{entry.exerciseName}</p>
        <p className="text-xs text-muted-foreground">
          {entry.sets} séries × {entry.reps} · repos {entry.restSeconds}s
          {entry.notes ? ` · ${entry.notes}` : ''}
        </p>
      </div>
      {canManage && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={deleteExercise.isPending}
          onClick={() => deleteExercise.mutate({ dayId, exerciseEntryId: entry.id })}
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </li>
  )
}

function AddExerciseForm({ programId, dayId }: { programId: string; dayId: string }) {
  const [open, setOpen] = useState(false)
  const { data: exercises = [] } = useExercises({})
  const addExercise = useAddExercise(programId)

  const form = useForm({
    resolver: zodResolver(exerciseEntryFormSchema),
    defaultValues: { exerciseId: '', sets: 3, reps: '8-12', restSeconds: 90, notes: '' },
  })

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" /> Ajouter un exercice
      </Button>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          addExercise.mutate(
            { dayId, input: values },
            {
              onSuccess: () => {
                form.reset({ exerciseId: '', sets: 3, reps: '8-12', restSeconds: 90, notes: '' })
                setOpen(false)
              },
            },
          ),
        )}
        className="grid gap-2 rounded-md border p-3 sm:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="exerciseId"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
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
          name="sets"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  placeholder="Séries"
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
                <Input placeholder="Répétitions (ex: 8-12)" {...field} />
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Notes (optionnel)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" size="sm" disabled={addExercise.isPending}>
            {addExercise.isPending && <Loader2 className="animate-spin" />}
            Ajouter
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  )
}
