import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useMuscleGroups, useTags } from '../hooks/use-catalog'
import {
  DIFFICULTY_LABELS,
  type Exercise,
  type ExerciseFormInput,
  MUSCLE_ROLE_LABELS,
  difficulties,
  exerciseFormSchema,
  muscleRoles,
} from '../schemas'

export function ExerciseForm({
  exercise,
  exercises,
  onSubmit,
  isPending,
}: {
  exercise?: Exercise
  exercises: Exercise[]
  onSubmit: (values: ExerciseFormInput) => void
  isPending: boolean
}) {
  const { data: muscleGroups = [] } = useMuscleGroups()
  const { data: tags = [] } = useTags()

  const form = useForm<ExerciseFormInput>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: exercise?.name ?? '',
      description: exercise?.description ?? '',
      equipment: exercise?.equipment ?? '',
      difficulty: exercise?.difficulty ?? 'BEGINNER',
      defaultRestSeconds: exercise?.defaultRestSeconds ?? 90,
      mediaUrl: exercise?.mediaUrl ?? '',
      muscles: exercise?.muscles.map((m) => ({ muscleGroupId: m.muscleGroupId, role: m.role })) ?? [],
      tagIds: exercise?.tags.map((t) => t.id) ?? [],
      alternativeExerciseIds: exercise?.alternativeExerciseIds ?? [],
    },
  })

  const handleSubmit = form.handleSubmit(onSubmit)
  const otherExercises = exercises.filter((e) => e.id !== exercise?.id)

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Développé couché" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / consignes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Position, exécution, points de vigilance..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="equipment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matériel</FormLabel>
                <FormControl>
                  <Input placeholder="Barre, haltères, aucun..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulté</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {difficulties.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DIFFICULTY_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="defaultRestSeconds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repos par défaut (secondes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={1200}
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
          name="muscles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Groupes musculaires sollicités</FormLabel>
              <div className="grid gap-2 sm:grid-cols-2">
                {muscleGroups.map((group) => {
                  const current = field.value.find((m) => m.muscleGroupId === group.id)
                  return (
                    <div key={group.id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input accent-primary"
                          checked={Boolean(current)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, { muscleGroupId: group.id, role: 'PRIMARY' }])
                            } else {
                              field.onChange(field.value.filter((m) => m.muscleGroupId !== group.id))
                            }
                          }}
                        />
                        {group.name}
                      </label>
                      {current && (
                        <select
                          className="rounded border border-input bg-transparent px-1.5 py-0.5 text-xs"
                          value={current.role}
                          onChange={(e) =>
                            field.onChange(
                              field.value.map((m) =>
                                m.muscleGroupId === group.id
                                  ? { ...m, role: e.target.value as (typeof muscleRoles)[number] }
                                  : m,
                              ),
                            )
                          }
                        >
                          {muscleRoles.map((role) => (
                            <option key={role} value={role}>
                              {MUSCLE_ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const checked = field.value.includes(tag.id)
                  return (
                    <label
                      key={tag.id}
                      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        className="size-3.5 rounded border-input accent-primary"
                        checked={checked}
                        onChange={(e) => {
                          field.onChange(
                            e.target.checked
                              ? [...field.value, tag.id]
                              : field.value.filter((id) => id !== tag.id),
                          )
                        }}
                      />
                      {tag.name}
                    </label>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {otherExercises.length > 0 && (
          <FormField
            control={form.control}
            name="alternativeExerciseIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternatives (si matériel manquant)</FormLabel>
                <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-md border p-2">
                  {otherExercises.map((other) => {
                    const checked = field.value.includes(other.id)
                    return (
                      <label key={other.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input accent-primary"
                          checked={checked}
                          onChange={(e) => {
                            field.onChange(
                              e.target.checked
                                ? [...field.value, other.id]
                                : field.value.filter((id) => id !== other.id),
                            )
                          }}
                        />
                        {other.name}
                      </label>
                    )
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {exercise ? 'Enregistrer' : 'Créer l’exercice'}
        </Button>
      </form>
    </Form>
  )
}
