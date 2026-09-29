import { Plus } from 'lucide-react'
import { useState } from 'react'

import { ErrorState } from '@/components/feedback'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDuration } from '@/lib/format'

import { CreateSessionDialog } from '../components/create-session-dialog'
import { SessionsTable } from '../components/sessions-table'
import { useSessions } from '../hooks/use-sessions'
import { SESSION_TYPE_LABELS, SESSION_TYPES, type SessionType } from '../schemas'

type Filter = SessionType | 'ALL'

export function TrainingPage() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const sessions = useSessions(filter === 'ALL' ? {} : { type: filter })

  const totalMinutes = sessions.data?.reduce((sum, s) => sum + s.durationMinutes, 0) ?? 0

  return (
    <>
      <PageHeader
        title="Entraînements"
        description="Votre carnet de séances : tout ce que vous avez réalisé, au même endroit."
        actions={<CreateSessionDialog />}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="ALL">Toutes</TabsTrigger>
            {SESSION_TYPES.map((type) => (
              <TabsTrigger key={type} value={type}>
                {SESSION_TYPE_LABELS[type]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {sessions.data && sessions.data.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {sessions.data.length} séance{sessions.data.length > 1 ? 's' : ''} ·{' '}
            {formatDuration(totalMinutes)}
          </p>
        )}
      </div>

      {sessions.isError ? (
        <ErrorState error={sessions.error} onRetry={() => void sessions.refetch()} />
      ) : (
        <SessionsTable
          sessions={sessions.data}
          isLoading={sessions.isPending}
          emptyAction={
            <CreateSessionDialog
              trigger={
                <Button variant="outline">
                  <Plus /> Ajouter une séance
                </Button>
              }
            />
          }
        />
      )}
    </>
  )
}
