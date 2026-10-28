import { Dumbbell, Loader2, Pencil, Timer, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { useDeleteExercise, useUpdateExercise } from '../hooks/use-catalog'
import { DIFFICULTY_LABELS, type Exercise, type ExerciseFormInput } from '../schemas'
import { ExerciseForm } from './exercise-form'

export function ExerciseCard({
  exercise,
  exercises,
  canManage,
}: {
  exercise: Exercise
  exercises: Exercise[]
  canManage: boolean
}) {
  const [editOpen, setEditOpen] = useState(false)
  const updateExercise = useUpdateExercise(exercise.id)
  const deleteExercise = useDeleteExercise()

  function handleUpdate(values: ExerciseFormInput) {
    updateExercise.mutate(values, { onSuccess: () => setEditOpen(false) })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base">{exercise.name}</CardTitle>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="outline">{DIFFICULTY_LABELS[exercise.difficulty]}</Badge>
            {exercise.equipment && (
              <span className="flex items-center gap-1">
                <Dumbbell className="size-3.5" /> {exercise.equipment}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Timer className="size-3.5" /> {exercise.defaultRestSeconds}s
            </span>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={deleteExercise.isPending}
              onClick={() => deleteExercise.mutate(exercise.id)}
            >
              {deleteExercise.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {exercise.description && (
          <p className="text-sm text-muted-foreground">{exercise.description}</p>
        )}
        {exercise.muscles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {exercise.muscles.map((m) => (
              <Badge key={m.muscleGroupId} variant={m.role === 'PRIMARY' ? 'default' : 'secondary'}>
                {m.muscleGroupName}
              </Badge>
            ))}
          </div>
        )}
        {exercise.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {exercise.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l’exercice</DialogTitle>
          </DialogHeader>
          <ExerciseForm
            exercise={exercise}
            exercises={exercises}
            onSubmit={handleUpdate}
            isPending={updateExercise.isPending}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
