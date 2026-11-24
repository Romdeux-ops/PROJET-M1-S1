import { Copy, Eye, Loader2, Pencil, Trash2, User, Users } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { useDeleteProgram, useDuplicateProgram, useUpdateProgram } from '../hooks/use-programs'
import {
  CATEGORY_LABELS,
  LEVEL_LABELS,
  VISIBILITY_LABELS,
  type Program,
  type ProgramFormInput,
} from '../schemas'
import { ProgramDetail } from './program-detail'
import { ProgramForm } from './program-form'
import { StaticStars } from './rating-widget'

const VISIBILITY_VARIANTS: Record<Program['visibility'], 'default' | 'secondary' | 'outline'> = {
  PUBLIC: 'default',
  CLIENTS: 'outline',
  PRIVATE: 'secondary',
}

export function ProgramCard({ program }: { program: Program }) {
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const duplicate = useDuplicateProgram()
  const deleteProgram = useDeleteProgram()
  const updateProgram = useUpdateProgram(program.id)

  function handleUpdate(values: ProgramFormInput) {
    updateProgram.mutate(values, { onSuccess: () => setEditOpen(false) })
  }

  return (
    <Card>
      <CardHeader className="space-y-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{program.title}</CardTitle>
          <Badge variant={VISIBILITY_VARIANTS[program.visibility]}>
            {program.visibility === 'CLIENTS' && <Users className="size-3" />}
            {VISIBILITY_LABELS[program.visibility]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline">{CATEGORY_LABELS[program.category]}</Badge>
          <Badge variant="outline">{LEVEL_LABELS[program.level]}</Badge>
          <span className="flex items-center gap-1">
            <User className="size-3.5" /> {program.ownerName}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {program.description && (
          <p className="text-sm text-muted-foreground">{program.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StaticStars value={program.averageRating} />
            <span className="text-xs text-muted-foreground">({program.ratingsCount})</span>
          </div>
          <span className="text-xs text-muted-foreground">{program.days.length} jour(s)</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setViewOpen(true)}>
            <Eye className="size-3.5" /> Voir
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={duplicate.isPending}
            onClick={() => duplicate.mutate(program.id)}
          >
            {duplicate.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Copy className="size-3.5" />
            )}
            Dupliquer
          </Button>
          {program.mine && (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleteProgram.isPending}
                onClick={() => deleteProgram.mutate(program.id)}
              >
                {deleteProgram.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{program.title}</DialogTitle>
          </DialogHeader>
          <ProgramDetail programId={program.id} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le programme</DialogTitle>
          </DialogHeader>
          <ProgramForm
            program={program}
            onSubmit={handleUpdate}
            isPending={updateProgram.isPending}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
