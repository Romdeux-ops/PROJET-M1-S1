import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useHasRole } from '@/lib/auth/session'

import { ExerciseCard } from '../components/exercise-card'
import { ExerciseFiltersBar } from '../components/exercise-filters'
import { ExerciseForm } from '../components/exercise-form'
import { useCreateExercise, useExercises } from '../hooks/use-catalog'
import type { ExerciseFormInput, ExerciseSearchFilters } from '../schemas'

export function CatalogPage() {
  const canManage = useHasRole('COACH', 'ADMIN')
  const [filters, setFilters] = useState<ExerciseSearchFilters>({})
  const [createOpen, setCreateOpen] = useState(false)
  const { data: exercises = [], isLoading } = useExercises(filters)
  const createExercise = useCreateExercise()

  function handleCreate(values: ExerciseFormInput) {
    createExercise.mutate(values, { onSuccess: () => setCreateOpen(false) })
  }

  return (
    <>
      <PageHeader
        title="Catalogue d'exercices"
        description="Fiches exercices, muscles sollicités et alternatives."
        actions={
          canManage && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus /> Ajouter un exercice
            </Button>
          )
        }
      />

      <div className="space-y-4">
        <ExerciseFiltersBar filters={filters} onChange={setFilters} />

        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun exercice ne correspond à ces critères.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                exercises={exercises}
                canManage={canManage}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un exercice</DialogTitle>
          </DialogHeader>
          <ExerciseForm
            exercises={exercises}
            onSubmit={handleCreate}
            isPending={createExercise.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
