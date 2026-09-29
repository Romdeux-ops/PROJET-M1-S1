import { Dumbbell, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { type Column, DataTable } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { formatDate, formatDuration } from '@/lib/format'

import { useDeleteSession } from '../hooks/use-sessions'
import type { TrainingSession } from '../schemas'
import { EffortMeter } from './effort-meter'
import { SessionTypeBadge } from './session-type-badge'

interface SessionsTableProps {
  sessions: TrainingSession[] | undefined
  isLoading: boolean
  emptyAction?: ReactNode
}

export function SessionsTable({ sessions, isLoading, emptyAction }: SessionsTableProps) {
  const deleteSession = useDeleteSession()

  const columns: Column<TrainingSession>[] = [
    {
      key: 'title',
      header: 'Séance',
      cell: (s) => (
        <div className="min-w-40">
          <p className="font-medium">{s.title}</p>
          <p className="text-xs text-muted-foreground">
            {s.exerciseCount} exercice{s.exerciseCount > 1 ? 's' : ''}
          </p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', cell: (s) => <SessionTypeBadge type={s.type} /> },
    {
      key: 'date',
      header: 'Date',
      cell: (s) => <span className="whitespace-nowrap">{formatDate(s.date)}</span>,
    },
    {
      key: 'duration',
      header: 'Durée',
      cell: (s) => <span className="tabular-nums">{formatDuration(s.durationMinutes)}</span>,
    },
    { key: 'effort', header: 'Effort', cell: (s) => <EffortMeter value={s.perceivedEffort} /> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'w-12 text-right',
      cell: (s) => (
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
      ),
    },
  ]

  return (
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
  )
}
