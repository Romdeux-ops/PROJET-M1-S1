import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSessions } from '@/features/training'
import { formatDate } from '@/lib/format'

import { useComplete } from '../hooks/use-planning'

export function CompleteSessionForm({
  scheduledSessionId,
  onDone,
}: {
  scheduledSessionId: string
  onDone: () => void
}) {
  const { data: sessions = [], isLoading } = useSessions()
  const [workoutSessionId, setWorkoutSessionId] = useState('')
  const complete = useComplete()

  if (isLoading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune séance dans votre carnet d'entraînement. Enregistrez-en une depuis la page
        Entraînements avant de la rattacher ici.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choisissez la séance de votre carnet d'entraînement correspondant à ce qui a été réalisé.
      </p>
      <Select value={workoutSessionId} onValueChange={setWorkoutSessionId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir une séance" />
        </SelectTrigger>
        <SelectContent>
          {sessions.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.title} — {formatDate(s.performedAt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        disabled={!workoutSessionId || complete.isPending}
        onClick={() =>
          complete.mutate({ id: scheduledSessionId, workoutSessionId }, { onSuccess: onDone })
        }
      >
        {complete.isPending && <Loader2 className="animate-spin" />}
        Confirmer
      </Button>
    </div>
  )
}
