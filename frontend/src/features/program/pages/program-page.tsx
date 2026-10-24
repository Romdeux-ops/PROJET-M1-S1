import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { ProgramCard } from '../components/program-card'
import { ProgramForm } from '../components/program-form'
import { useCreateProgram, usePrograms } from '../hooks/use-programs'
import {
  CATEGORY_LABELS,
  LEVEL_LABELS,
  type ProgramFormInput,
  type ProgramSearchFilters,
  programCategories,
  programLevels,
} from '../schemas'

const ALL = '__all__'

export function ProgramPage() {
  const [filters, setFilters] = useState<ProgramSearchFilters>({})
  const [createOpen, setCreateOpen] = useState(false)
  const { data: programs = [], isLoading } = usePrograms(filters)
  const createProgram = useCreateProgram()

  function handleCreate(values: ProgramFormInput) {
    createProgram.mutate(values, { onSuccess: () => setCreateOpen(false) })
  }

  return (
    <>
      <PageHeader
        title="Programmes"
        description="Programmes structurés en jours et exercices prescrits."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Créer un programme
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={filters.mineOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters((f) => ({ ...f, mineOnly: !f.mineOnly }))}
          >
            Mes programmes
          </Button>

          <Select
            value={filters.category ?? ALL}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, category: value === ALL ? undefined : (value as typeof f.category) }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes catégories</SelectItem>
              {programCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.level ?? ALL}
            onValueChange={(value) =>
              setFilters((f) => ({ ...f, level: value === ALL ? undefined : (value as typeof f.level) }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous niveaux</SelectItem>
              {programLevels.map((l) => (
                <SelectItem key={l} value={l}>
                  {LEVEL_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : programs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun programme ne correspond à ces critères.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un programme</DialogTitle>
          </DialogHeader>
          <ProgramForm onSubmit={handleCreate} isPending={createProgram.isPending} />
        </DialogContent>
      </Dialog>
    </>
  )
}
