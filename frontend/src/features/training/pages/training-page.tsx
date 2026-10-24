import { Plus } from 'lucide-react'

import { ErrorState } from '@/components/feedback'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'

import { CreateSessionDialog } from '../components/create-session-dialog'
import { PersonalRecordsPanel } from '../components/personal-records-panel'
import { SessionsTable } from '../components/sessions-table'
import { useSessions } from '../hooks/use-sessions'

export function TrainingPage() {
  const sessions = useSessions()

  return (
    <>
      <PageHeader
        title="Entraînements"
        description="Votre carnet de séances : tout ce que vous avez réalisé, au même endroit."
        actions={<CreateSessionDialog />}
      />

      <div className="space-y-6">
        <PersonalRecordsPanel />

        {sessions.data && sessions.data.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {sessions.data.length} séance{sessions.data.length > 1 ? 's' : ''}
          </p>
        )}

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
      </div>
    </>
  )
}
