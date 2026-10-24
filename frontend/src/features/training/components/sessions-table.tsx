import { Dumbbell, Eye, Trash2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { type Column, DataTable } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate, formatDuration } from '@/lib/format'

import { useDeleteSession } from '../hooks/use-sessions'
import type { TrainingSession } from '../schemas'
import { SessionSetsPanel } from './session-sets-panel'

interface SessionsTableProps {
  sessions: TrainingSession[] | undefined
  isLoading: boolean
  emptyAction?: ReactNode
}

export function SessionsTable({ sessions, isLoading, emptyAction }: SessionsTableProps) {
  const deleteSession = useDeleteSession()
  const [detailId, setDetailId] = useState<string | null>(null)
  const detailSession = sessions?.find((s) => s.id === detailId)

  const columns: Column<TrainingSession>[] = [
    {
      key: 'title',
      header: 'Séance',
      cell: (s) => <p className="min-w-40 font-medium">{s.title}</p>,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (s) => <span className="whitespace-nowrap">{formatDate(s.performedAt)}</span>,
    },
    {
      key: 'duration',
      header: 'Durée',
      cell: (s) => (
        <span className="tabular-nums">{s.durationMinutes != null ? formatDuration(s.durationMinutes) : '—'}</span>
      ),
    },
    {
      key: 'sets',
      header: 'Séries',
      cell: (s) => <span className="tabular-nums">{s.sets.length}</span>,
    },
    {
      key: 'volume',
      header: 'Volume',
      cell: (s) => <span className="tabular-nums">{s.totalVolume.toLocaleString('fr-FR')} kg</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'w-20 text-right',
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Voir ${s.title}`} onClick={() => setDetailId(s.id)}>
            <Eye />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Supprimer ${s.title}`}
            disabled={deleteSession.isPending && deleteSession.variables === s.id}
            onClick={() => deleteSession.mutate(s.id)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={sessions}
        getRowId={(s) => s.id}
        isLoading={isLoading}
        empty={
          <EmptyState
            icon={Dumbbell}
            title="Aucune séance pour l'instant"
            description="Enregistrez votre première séance pour commencer à suivre votre progression."
            action={emptyAction}
          />
        }
      />

      <Dialog open={detailId !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailSession?.title}</DialogTitle>
          </DialogHeader>
          {detailId && <SessionSetsPanel sessionId={detailId} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
